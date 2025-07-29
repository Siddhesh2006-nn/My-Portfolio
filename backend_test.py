#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Techno Tower Task Management System
Tests all CRUD operations, project-task associations, and stats dashboard
"""

import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("ERROR: REACT_APP_BACKEND_URL not found in frontend/.env")
    exit(1)

API_BASE = f"{BACKEND_URL}/api"

print(f"Testing Techno Tower Backend API at: {API_BASE}")
print("=" * 60)

# Test data
test_project_data = {
    "name": "Manufacturing Process Optimization",
    "description": "Streamline production line efficiency for Techno Tower"
}

test_task_data = {
    "title": "Quality Control Inspection",
    "description": "Implement automated quality checks on assembly line",
    "priority": "high",
    "assignee": "John Smith",
    "due_date": (datetime.now() + timedelta(days=7)).isoformat()
}

test_project_task_data = {
    "title": "Equipment Maintenance Schedule",
    "description": "Create preventive maintenance calendar for all machinery",
    "priority": "medium",
    "assignee": "Sarah Johnson"
}

# Global variables to store created IDs
created_project_id = None
created_task_id = None
created_project_task_id = None

def test_api_endpoint(method, endpoint, data=None, expected_status=200):
    """Helper function to test API endpoints"""
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        print(f"{method} {endpoint} - Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print("✅ SUCCESS")
            if response.content:
                try:
                    return response.json()
                except:
                    return response.text
            return True
        else:
            print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_root_endpoint():
    """Test the root API endpoint"""
    print("\n1. Testing Root Endpoint")
    print("-" * 30)
    result = test_api_endpoint("GET", "/")
    if result:
        print(f"Response: {result}")
    return result

def test_project_crud():
    """Test Project CRUD operations"""
    global created_project_id
    
    print("\n2. Testing Project CRUD Operations")
    print("-" * 40)
    
    # CREATE Project
    print("\n2.1 Creating Project...")
    project = test_api_endpoint("POST", "/projects", test_project_data)
    if project:
        created_project_id = project.get('id')
        print(f"Created project ID: {created_project_id}")
        print(f"Project name: {project.get('name')}")
        print(f"Task count: {project.get('task_count', 0)}")
    
    # READ Projects
    print("\n2.2 Getting All Projects...")
    projects = test_api_endpoint("GET", "/projects")
    if projects:
        print(f"Found {len(projects)} projects")
        for p in projects:
            print(f"  - {p.get('name')} (ID: {p.get('id')}, Tasks: {p.get('task_count', 0)})")
    
    # READ Single Project
    if created_project_id:
        print(f"\n2.3 Getting Project by ID: {created_project_id}")
        project = test_api_endpoint("GET", f"/projects/{created_project_id}")
        if project:
            print(f"Project: {project.get('name')} - Status: {project.get('status')}")
    
    # UPDATE Project
    if created_project_id:
        print(f"\n2.4 Updating Project...")
        update_data = {
            "name": "Advanced Manufacturing Process Optimization",
            "status": "active"
        }
        updated_project = test_api_endpoint("PUT", f"/projects/{created_project_id}", update_data)
        if updated_project:
            print(f"Updated project name: {updated_project.get('name')}")
            print(f"Updated status: {updated_project.get('status')}")
    
    return created_project_id is not None

def test_task_crud():
    """Test Task CRUD operations"""
    global created_task_id
    
    print("\n3. Testing Task CRUD Operations")
    print("-" * 35)
    
    # CREATE Independent Task
    print("\n3.1 Creating Independent Task...")
    task = test_api_endpoint("POST", "/tasks", test_task_data)
    if task:
        created_task_id = task.get('id')
        print(f"Created task ID: {created_task_id}")
        print(f"Task title: {task.get('title')}")
        print(f"Priority: {task.get('priority')}")
        print(f"Assignee: {task.get('assignee')}")
        print(f"Project ID: {task.get('project_id', 'None (Independent)')}")
    
    # READ Independent Tasks
    print("\n3.2 Getting Independent Tasks...")
    tasks = test_api_endpoint("GET", "/tasks")
    if tasks:
        print(f"Found {len(tasks)} independent tasks")
        for t in tasks:
            print(f"  - {t.get('title')} (Status: {t.get('status')}, Priority: {t.get('priority')})")
    
    # READ Single Task
    if created_task_id:
        print(f"\n3.3 Getting Task by ID: {created_task_id}")
        task = test_api_endpoint("GET", f"/tasks/{created_task_id}")
        if task:
            print(f"Task: {task.get('title')} - Status: {task.get('status')}")
    
    # UPDATE Task
    if created_task_id:
        print(f"\n3.4 Updating Task Status...")
        update_data = {
            "status": "in_progress",
            "priority": "urgent"
        }
        updated_task = test_api_endpoint("PUT", f"/tasks/{created_task_id}", update_data)
        if updated_task:
            print(f"Updated status: {updated_task.get('status')}")
            print(f"Updated priority: {updated_task.get('priority')}")
    
    return created_task_id is not None

def test_project_task_association():
    """Test Project-Task Association functionality"""
    global created_project_task_id
    
    print("\n4. Testing Project-Task Association")
    print("-" * 40)
    
    if not created_project_id:
        print("❌ No project available for association testing")
        return False
    
    # CREATE Task with Project Association
    print(f"\n4.1 Creating Task Associated with Project {created_project_id}...")
    project_task_data = test_project_task_data.copy()
    project_task_data["project_id"] = created_project_id
    
    project_task = test_api_endpoint("POST", "/tasks", project_task_data)
    if project_task:
        created_project_task_id = project_task.get('id')
        print(f"Created project task ID: {created_project_task_id}")
        print(f"Associated with project: {project_task.get('project_id')}")
    
    # Verify Project Task Count Updated
    print(f"\n4.2 Verifying Project Task Count Updated...")
    project = test_api_endpoint("GET", f"/projects/{created_project_id}")
    if project:
        task_count = project.get('task_count', 0)
        print(f"Project task count: {task_count}")
        if task_count > 0:
            print("✅ Project task count correctly updated")
        else:
            print("❌ Project task count not updated")
    
    # GET Project-Specific Tasks
    print(f"\n4.3 Getting Tasks for Project {created_project_id}...")
    project_tasks = test_api_endpoint("GET", f"/projects/{created_project_id}/tasks")
    if project_tasks:
        print(f"Found {len(project_tasks)} tasks for this project")
        for t in project_tasks:
            print(f"  - {t.get('title')} (Status: {t.get('status')})")
    
    # GET Tasks with Project Filter
    print(f"\n4.4 Getting Tasks with Project Filter...")
    filtered_tasks = test_api_endpoint("GET", f"/tasks?project_id={created_project_id}")
    if filtered_tasks:
        print(f"Found {len(filtered_tasks)} tasks with project filter")
    
    return created_project_task_id is not None

def test_stats_dashboard():
    """Test Stats Dashboard API"""
    print("\n5. Testing Stats Dashboard API")
    print("-" * 35)
    
    stats = test_api_endpoint("GET", "/stats")
    if stats:
        print("📊 Dashboard Statistics:")
        
        # Task stats
        task_stats = stats.get('tasks', {})
        print(f"  Tasks:")
        print(f"    Total: {task_stats.get('total', 0)}")
        print(f"    Completed: {task_stats.get('completed', 0)}")
        print(f"    Pending: {task_stats.get('pending', 0)}")
        print(f"    In Progress: {task_stats.get('in_progress', 0)}")
        print(f"    Urgent: {task_stats.get('urgent', 0)}")
        
        # Project stats
        project_stats = stats.get('projects', {})
        print(f"  Projects:")
        print(f"    Total: {project_stats.get('total', 0)}")
        print(f"    Active: {project_stats.get('active', 0)}")
        print(f"    Completed: {project_stats.get('completed', 0)}")
        
        return True
    
    return False

def test_task_status_transitions():
    """Test task status transitions"""
    print("\n6. Testing Task Status Transitions")
    print("-" * 40)
    
    if not created_task_id:
        print("❌ No task available for status transition testing")
        return False
    
    statuses = ["pending", "in_progress", "completed"]
    
    for status in statuses:
        print(f"\n6.{statuses.index(status) + 1} Updating task to '{status}'...")
        update_data = {"status": status}
        updated_task = test_api_endpoint("PUT", f"/tasks/{created_task_id}", update_data)
        if updated_task:
            print(f"✅ Task status updated to: {updated_task.get('status')}")
        else:
            print(f"❌ Failed to update task status to: {status}")
            return False
    
    return True

def test_priority_levels():
    """Test different priority levels"""
    print("\n7. Testing Priority Levels")
    print("-" * 30)
    
    if not created_task_id:
        print("❌ No task available for priority testing")
        return False
    
    priorities = ["low", "medium", "high", "urgent"]
    
    for priority in priorities:
        print(f"\n7.{priorities.index(priority) + 1} Setting priority to '{priority}'...")
        update_data = {"priority": priority}
        updated_task = test_api_endpoint("PUT", f"/tasks/{created_task_id}", update_data)
        if updated_task:
            print(f"✅ Task priority updated to: {updated_task.get('priority')}")
        else:
            print(f"❌ Failed to update task priority to: {priority}")
            return False
    
    return True

def test_cleanup():
    """Clean up test data"""
    print("\n8. Cleanup Test Data")
    print("-" * 25)
    
    success = True
    
    # Delete individual task first
    if created_task_id:
        print(f"\n8.1 Deleting independent task {created_task_id}...")
        result = test_api_endpoint("DELETE", f"/tasks/{created_task_id}")
        if not result:
            success = False
    
    # Delete project (this should also delete associated tasks)
    if created_project_id:
        print(f"\n8.2 Deleting project {created_project_id} (and associated tasks)...")
        result = test_api_endpoint("DELETE", f"/projects/{created_project_id}")
        if not result:
            success = False
    
    return success

def main():
    """Run all tests"""
    print("🚀 Starting Techno Tower Backend API Tests")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    test_results.append(("Root Endpoint", test_root_endpoint()))
    test_results.append(("Project CRUD", test_project_crud()))
    test_results.append(("Task CRUD", test_task_crud()))
    test_results.append(("Project-Task Association", test_project_task_association()))
    test_results.append(("Stats Dashboard", test_stats_dashboard()))
    test_results.append(("Task Status Transitions", test_task_status_transitions()))
    test_results.append(("Priority Levels", test_priority_levels()))
    test_results.append(("Cleanup", test_cleanup()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("🏁 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<30} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)