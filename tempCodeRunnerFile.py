    def process_line(line):
        # Count leading tabs to determine level
        level = len(line) - len(line.lstrip('\t'))
        # Clean the line
        content = line.strip()
        # Split if there's a colon
        if ':' in content:
            # Check if the content should be formatted or not
            if level > 1:  # Assuming values like BMW, Mercedes are at level > 1
                return level, content
            return level, format_name(content)
        return level, format_name(content)