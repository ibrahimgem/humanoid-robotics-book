# Data Model: Docusaurus-based Humanoid Robotics Book

## Content Entities

### Book Chapter
- **Name**: Unique identifier for the chapter (e.g., "introduction", "ros2-basics")
- **Title**: Display title for the chapter
- **Content**: MDX-formatted content with embedded code, diagrams, and text
- **Metadata**:
  - Author information
  - Creation date
  - Last modified date
  - Source citations (IEEE format)
  - Dependencies (previous chapters required)
- **Relationships**:
  - Predecessor chapter (for learning path)
  - Successor chapter (for learning path)
  - Related chapters (cross-references)

### Code Example
- **Name**: Unique identifier within the chapter
- **Language**: Programming language or configuration format (Python, C++, YAML, etc.)
- **Source**: The actual code content
- **Description**: Explanation of what the code does
- **Validation status**: Whether the code has been tested against actual systems
- **Relationships**:
  - Parent chapter
  - Related concepts (links to relevant sections)

### Diagram
- **Type**: Diagram format (Mermaid, SVG, image file)
- **Title**: Descriptive title for the diagram
- **Description**: Explanation of what the diagram illustrates
- **Source**: The diagram definition or file path
- **Relationships**:
  - Parent chapter
  - Related concepts

### Hardware Specification Table
- **Name**: Hardware component identifier
- **Category**: Type of component (Sim Rig, Jetson, Sensors, Robots, etc.)
- **Specifications**: Key technical parameters in tabular format
- **Relationships**:
  - Parent chapter
  - Related implementation sections

### Citation
- **ID**: Unique identifier for the citation
- **Format**: IEEE-formatted citation string
- **Type**: Research paper, textbook, documentation, etc.
- **URL**: Link to the source (if available)
- **Relationships**:
  - Referenced chapters
  - Referenced code examples or diagrams

## Navigation Structure

### Sidebar Configuration
- **Items**: List of chapters in learning order
- **Categories**: Grouped sections (Introduction, ROS2, Simulation, etc.)
- **Metadata**:
  - Previous/next navigation
  - Learning objectives for each section

## Validation Rules

1. Each chapter must have valid MDX syntax
2. All citations must follow IEEE format
3. Code examples must be validated against actual systems
4. Diagrams must render correctly in Docusaurus
5. All cross-references must point to existing content
6. Each chapter must be between 1000-2000 words
7. All external links must be verified for accuracy