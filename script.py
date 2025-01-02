import json 

def format_name(name):
    # Remove any prefix before colon (e.g., "THEMA:", "GESELLSCHAFT:")
    if ':' in name:
        name = name.split(':')[-1]
        # Handle cases with multiple colons by taking the last part
        if '-' in name:
            name = name.replace('-', ' ')
    return name.strip()

def process_line(line):
    # Count leading tabs to determine level
    level = len(line) - len(line.lstrip('\t'))
    # Clean the line
    content = line.strip()
    # Split if there's a colon
    if ':' in content:
        return level, format_name(content)
    return level, format_name(content)

def build_json_structure(lines):
    result = {}
    current_path = []
    last_level = -1
    
    for line in lines:
        if not line.strip():
            continue
            
        level, content = process_line(line)
        
        # Adjust current path based on level
        if level <= last_level:
            current_path = current_path[:level]
        current_path = current_path[:level]
        current_path.append(content)
        last_level = level
        
        # Build the structure
        current_dict = result
        if level == 0:  # Root level
            if content not in result:
                result[content] = {}
        else:
            parent_path = current_path[:-1]
            
            # Navigate to the correct nested level
            for path_part in parent_path:
                if path_part not in current_dict:
                    current_dict[path_part] = {}
                current_dict = current_dict[path_part]
            
            # Check if we're at a leaf level
            next_level_exists = False
            for next_line in lines[lines.index(line) + 1:]:
                if not next_line.strip():
                    continue
                next_level, _ = process_line(next_line)
                if next_level > level:
                    next_level_exists = True
                    break
                if next_level <= level:
                    break
            
            if not next_level_exists:
                # We're at a leaf level, add to values array
                if "values" not in current_dict:
                    current_dict["values"] = []
                if content not in current_dict["values"]:
                    current_dict["values"].append(content)
            else:
                # This is an intermediate node
                if content not in current_dict:
                    current_dict[content] = {}

    return result

def convert_text_to_json(content):
    lines = content.split('\n')
    return build_json_structure(lines)

# # Example usage
# content = """THEMA:Geschichte
# \t\tTHEMA:GESELLSCHAFT
# \t\t\tTHEMA:GESELLSCHAFT:Arbeit/Bildung
# \t\t\t\tTHEMA:GESELLSCHAFT:ARBEIT-BILDUNG:Arbeitslosigkeit
# \t\t\t\tTHEMA:GESELLSCHAFT:ARBEIT-BILDUNG:Einkommen
# \t\t\t\tTHEMA:GESELLSCHAFT:ARBEIT-BILDUNG:Schule
# \t\t\t\tTHEMA:GESELLSCHAFT:ARBEIT-BILDUNG:Universität"""

# result = convert_text_to_json(content)
# print(json.dumps(result, indent=4))

with open('filters.txt', 'r') as file:
    content = file.read()
    result = convert_text_to_json(content)
    with open('outcome.json', 'w') as json_file:
        json.dump(result, json_file, indent=4)