import json

with open('result.json', 'r') as file:
    result = json.load(file)
    keys = list(result["1 neu"].keys())
    print(keys)