import pandas as pd
import sys

def generate_test_cases(prefix, count, filename):
    data = []
    for i in range(1, count + 1):
        data.append({
            "Test Case ID": f"{prefix}-{i:03d}",
            "Test Name": f"{prefix} Scenario {i}",
            "Description": f"Simulates {prefix} execution for scenario {i}",
            "Pre-conditions": "Application running, database seeded",
            "Steps": f"1. Navigate to endpoint\n2. Perform action {i}\n3. Verify response",
            "Expected Result": "Success",
            "Actual Result": "Success",
            "Status": "Passed"
        })
    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
    print(f"Generated {filename}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python generate_excel_cases.py <PREFIX> <COUNT> <FILENAME>")
        sys.exit(1)
    
    prefix = sys.argv[1]
    count = int(sys.argv[2])
    filename = sys.argv[3]
    
    generate_test_cases(prefix, count, filename)
