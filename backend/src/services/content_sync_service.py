"""
Content synchronization service for detecting book updates and managing incremental updates.
Monitors changes to book content and triggers re-embedding when needed.
"""
import os
import asyncio
import hashlib
import logging
from typing import List, Dict, Set, Optional
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading

from src.utils.content_parser import ContentParser
from src.utils.chunker import SemanticChunker
from src.utils.hash_utils import ContentHasher
from src.services.embedding_service import embedding_service
from src.database.connection import get_db
from src.models.chat_models import FileMap, KnowledgeChunk

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FileChange:
    """Represents a file change event."""
    file_path: str
    change_type: str  # 'created', 'modified', 'deleted'
    timestamp: datetime

class ContentSyncService(FileSystemEventHandler):
    """Service to monitor content changes and synchronize embeddings."""

    def __init__(self, docs_path: str = "docs", watch_interval: int = 5):
        self.docs_path = Path(docs_path)
        self.watch_interval = watch_interval
        self.content_parser = ContentParser(docs_path=docs_path)
        self.chunker = SemanticChunker()
        self.hasher = ContentHasher()
        self.observer = Observer()
        self.is_watching = False
        self.change_queue = []
        self.lock = threading.Lock()

    def start_monitoring(self):
        """Start monitoring the docs directory for changes."""
        if self.is_watching:
            logger.info("Content sync service already running")
            return

        # Schedule the directory for monitoring
        self.observer.schedule(self, str(self.docs_path), recursive=True)
        self.observer.start()
        self.is_watching = True
        logger.info(f"Started monitoring {self.docs_path} for content changes")

        # Start the monitoring loop
        try:
            while self.is_watching:
                # Process any queued changes
                self._process_queued_changes()
                # Sleep briefly to avoid busy waiting
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()

    def stop_monitoring(self):
        """Stop monitoring the docs directory."""
        self.is_watching = False
        if self.observer:
            self.observer.stop()
            self.observer.join()
        logger.info("Stopped monitoring content changes")

    def on_created(self, event):
        """Handle file creation events."""
        if not event.is_directory and event.src_path.endswith(('.md', '.mdx')):
            with self.lock:
                self.change_queue.append(FileChange(
                    file_path=event.src_path,
                    change_type='created',
                    timestamp=datetime.utcnow()
                ))
            logger.info(f"Detected new file: {event.src_path}")

    def on_modified(self, event):
        """Handle file modification events."""
        if not event.is_directory and event.src_path.endswith(('.md', '.mdx')):
            with self.lock:
                self.change_queue.append(FileChange(
                    file_path=event.src_path,
                    change_type='modified',
                    timestamp=datetime.utcnow()
                ))
            logger.info(f"Detected modified file: {event.src_path}")

    def on_deleted(self, event):
        """Handle file deletion events."""
        if not event.is_directory and event.src_path.endswith(('.md', '.mdx')):
            with self.lock:
                self.change_queue.append(FileChange(
                    file_path=event.src_path,
                    change_type='deleted',
                    timestamp=datetime.utcnow()
                ))
            logger.info(f"Detected deleted file: {event.src_path}")

    def _process_queued_changes(self):
        """Process all queued file changes."""
        with self.lock:
            changes_to_process = self.change_queue[:]
            self.change_queue = []

        for change in changes_to_process:
            self._handle_file_change(change)

    def _handle_file_change(self, change: FileChange):
        """Handle a single file change event."""
        try:
            if change.change_type == 'created' or change.change_type == 'modified':
                self._process_content_update(change.file_path)
            elif change.change_type == 'deleted':
                self._process_content_deletion(change.file_path)
        except Exception as e:
            logger.error(f"Error handling file change {change.file_path}: {e}")

    def _process_content_update(self, file_path: str):
        """Process an updated content file."""
        logger.info(f"Processing content update for: {file_path}")

        try:
            # Parse the updated file
            parsed_doc = self.content_parser.extract_text_from_mdx(file_path)

            # Chunk the content
            chunks = self.chunker.chunk_document(parsed_doc)

            # Update chunks with hashes
            updated_chunks = self.hasher.batch_update_chunks_with_hashes(chunks)

            # Check for existing file mapping in the database
            db = next(get_db())
            try:
                file_map = db.query(FileMap).filter(FileMap.original_path == file_path).first()

                if file_map:
                    # Update existing mapping
                    file_map.last_processed = datetime.utcnow()
                    file_map.processing_status = 'in_progress'
                    file_map.processed_chunks = len(updated_chunks)
                else:
                    # Create new mapping
                    file_map = FileMap(
                        original_path=file_path,
                        processed_chunks=len(updated_chunks),
                        last_processed=datetime.utcnow(),
                        processing_status='in_progress'
                    )
                    db.add(file_map)

                db.commit()

                # Process embeddings for the new/updated chunks
                asyncio.run(embedding_service.process_and_store_embeddings(updated_chunks))

                # Update file mapping status to completed
                file_map.processing_status = 'completed'
                db.commit()

                logger.info(f"Successfully processed {len(updated_chunks)} chunks for {file_path}")

            except Exception as e:
                logger.error(f"Error processing content update for {file_path}: {e}")
                if file_map:
                    file_map.processing_status = 'failed'
                    db.commit()
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error processing content update: {e}")

    def _process_content_deletion(self, file_path: str):
        """Process a deleted content file."""
        logger.info(f"Processing content deletion for: {file_path}")

        try:
            # Find and remove related knowledge chunks from database
            db = next(get_db())
            try:
                # Find chunks associated with this file
                chunks_to_delete = db.query(KnowledgeChunk).filter(
                    KnowledgeChunk.source_file.like(f"%{Path(file_path).name}%")
                ).all()

                chunk_ids = [str(chunk.id) for chunk in chunks_to_delete]

                # Remove from vector store
                if chunk_ids:
                    from src.vector_store.qdrant_client import qdrant_manager
                    qdrant_manager.delete_vectors(chunk_ids)

                # Remove from database
                for chunk in chunks_to_delete:
                    db.delete(chunk)

                # Update file mapping status
                file_map = db.query(FileMap).filter(FileMap.original_path == file_path).first()
                if file_map:
                    file_map.processing_status = 'deleted'
                    file_map.last_processed = datetime.utcnow()

                db.commit()
                logger.info(f"Removed {len(chunks_to_delete)} chunks for deleted file {file_path}")

            except Exception as e:
                logger.error(f"Error processing content deletion for {file_path}: {e}")
                db.rollback()
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error processing content deletion: {e}")

    def _get_file_hash(self, file_path: str) -> str:
        """Calculate hash of file contents to detect actual changes."""
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def sync_all_content(self) -> bool:
        """Perform a full sync of all content in the docs directory."""
        logger.info("Starting full content sync")

        try:
            # Get all MDX files
            all_files = self.content_parser.get_all_docs_files()
            logger.info(f"Found {len(all_files)} files to sync")

            processed_count = 0
            for file_path in all_files:
                self._process_content_update(file_path)
                processed_count += 1

            logger.info(f"Completed full sync of {processed_count} files")
            return True

        except Exception as e:
            logger.error(f"Error during full content sync: {e}")
            return False

    def get_sync_status(self) -> Dict:
        """Get current synchronization status."""
        db = next(get_db())
        try:
            total_files = db.query(FileMap).count()
            completed_files = db.query(FileMap).filter(FileMap.processing_status == 'completed').count()
            in_progress_files = db.query(FileMap).filter(FileMap.processing_status == 'in_progress').count()
            failed_files = db.query(FileMap).filter(FileMap.processing_status == 'failed').count()

            # Get vector count from Qdrant
            from src.vector_store.qdrant_client import qdrant_manager
            vector_count = qdrant_manager.get_vector_count()

            return {
                'total_files': total_files,
                'completed_files': completed_files,
                'in_progress_files': in_progress_files,
                'failed_files': failed_files,
                'vector_count': vector_count,
                'is_syncing': self.is_watching
            }
        finally:
            db.close()

    def force_resync_file(self, file_path: str) -> bool:
        """Force re-sync of a specific file."""
        logger.info(f"Force re-syncing file: {file_path}")

        if os.path.exists(file_path):
            self._process_content_update(file_path)
            return True
        else:
            logger.error(f"File does not exist: {file_path}")
            return False

    def force_resync_all(self) -> bool:
        """Force re-sync of all content."""
        logger.info("Force re-syncing all content")

        try:
            all_files = self.content_parser.get_all_docs_files()
            success_count = 0

            for file_path in all_files:
                if self.force_resync_file(file_path):
                    success_count += 1

            logger.info(f"Force re-sync completed for {success_count}/{len(all_files)} files")
            return True
        except Exception as e:
            logger.error(f"Error during force re-sync: {e}")
            return False

# Global content sync service instance
content_sync_service = ContentSyncService()

if __name__ == "__main__":
    # Example usage
    print("Content Sync Service initialized")
    print("To start monitoring: content_sync_service.start_monitoring()")
    print("To perform full sync: content_sync_service.sync_all_content()")
    print("To check status: content_sync_service.get_sync_status()")