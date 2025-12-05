# Content Creation Guidelines

This document outlines the standards and best practices for creating content in the Humanoid Robotics Book.

## Writing Standards

### Technical Accuracy
- All technical claims must be validated against primary documentation sources (ROS 2, Gazebo, Isaac, etc.)
- When in doubt about technical details, cite the official documentation
- Code examples should be tested and functional

### Citation Standards
- All technical claims must reference credible sources using IEEE citation format
- Use in-text citations like [1] and provide full references at the end of each chapter
- Example IEEE citation format:
  ```
  References:
  [1] A. Author, "Paper title," Journal Name, vol. X, no. Y, pp. ZZ-ZZ, Year.
  ```

### Content Structure
- Each chapter should be between 1000-2000 words
- Use clear headings and subheadings to organize content
- Include an introduction and conclusion for each chapter
- Provide practical examples alongside theoretical concepts

## Code Examples

### Language Standards
- Python examples should follow ROS 2 conventions
- Use descriptive variable names
- Include comments explaining complex operations
- Follow PEP 8 style guidelines

### Example Format
```python
# Brief description of what this code does
import rclpy
from rclpy.node import Node

class ExampleNode(Node):
    def __init__(self):
        super().__init__('example_node')
        # Initialize node components here
```

## Diagram Standards

### Mermaid Diagrams
- Use mermaid for flowcharts, sequence diagrams, and simple architecture diagrams
- Keep diagrams clear and uncluttered
- Include titles for all diagrams

### Custom Diagrams
- For complex robotics-specific diagrams, use the custom Diagram component
- Ensure diagrams are accessible with proper alt text

## Accessibility Standards

- Use semantic HTML elements appropriately
- Provide alternative text for images and diagrams
- Ensure sufficient color contrast
- Use descriptive link text

## File Organization

- Place each chapter in its appropriate subdirectory within `/docs/`
- Use descriptive file names with hyphens separating words
- Include proper frontmatter in each MDX file:
  ```md
  ---
  sidebar_position: X
  title: Chapter Title
  description: Brief description of the chapter content
  ---
  ```