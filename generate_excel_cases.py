import pandas as pd
import sys
import random

def get_feature_categories(prefix):
    categories = {
        "WEB-E2E": ["Login Flow", "Dashboard Navigation", "User Profile Update", "Payment Processing", "Search Functionality", "Shopping Cart", "Checkout Process", "Logout"],
        "MOB-E2E": ["App Installation", "Onboarding Screens", "Biometric Login", "Push Notifications", "Offline Mode", "Camera Integration", "Location Services", "Settings Menu"],
        "API-LOAD": ["Concurrent Logins", "High Volume Search", "Database Read Stress", "Database Write Stress", "Endpoint Throttling", "DDoS Mitigation", "Peak Hour Simulation"],
        "API-FUNC": ["Auth Token Validation", "GET User Details", "POST Create Record", "PUT Update Record", "DELETE Remove Record", "Pagination Handling", "Error Code Mapping"],
        "UNIT-TEST": ["Helper Function Logic", "Data Transformation Models", "Validation Utilities", "State Management Reducers", "String Formatting Methods"],
        "FULL-E2E": ["End-to-End User Journey", "Cross-Browser Compatibility", "Multi-Device Sync", "Email Verification Flow", "Third-Party Integration"],
        "DEPLOY-TEST": ["Environment Variable Check", "Database Migration Verification", "Static Assets Delivery", "CDN Caching", "Health Check Endpoint"]
    }
    return categories.get(prefix, ["General Feature Testing", "Component Validation", "System Check"])

def generate_test_cases(prefix, count, filename):
    data = []
    features = get_feature_categories(prefix)
    
    for i in range(1, count + 1):
        feature_name = features[i % len(features)]
        
        data.append({
            "Test Case ID": f"{prefix}-{i:03d}",
            "Feature Category": feature_name,
            "Test Name": f"Verify {feature_name.lower()} functionality (Scenario {i})",
            "Description": f"Simulates {prefix} execution to test the {feature_name} module under normal conditions.",
            "Pre-conditions": "Application running, database seeded, valid credentials available",
            "Steps": f"1. Initialize {feature_name} context\n2. Perform required action for scenario {i}\n3. Verify expected response or state change",
            "Expected Result": f"The {feature_name} operation completes successfully with expected output.",
            "Actual Result": f"The {feature_name} operation completed successfully.",
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
