from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import jwt
from passlib.context import CryptContext
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "techno-tower-secret-key-manufacturing-2025"
ALGORITHM = "HS256"

# Enums
class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress" 
    completed = "completed"
    blocked = "blocked"

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class ProjectStatus(str, Enum):
    planning = "planning"
    active = "active"
    completed = "completed"
    on_hold = "on_hold"

class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    operator = "operator"
    qc_inspector = "qc_inspector"

class ActivityType(str, Enum):
    task_created = "task_created"
    task_updated = "task_updated"
    task_completed = "task_completed"
    project_created = "project_created"
    comment_added = "comment_added"
    template_used = "template_used"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: str
    role: UserRole
    department: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.operator
    department: Optional[str] = ""

class UserLogin(BaseModel):
    username: str
    password: str

class TaskDependency(BaseModel):
    task_id: str
    dependency_type: str = "finish_to_start"

class TimeEntry(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    description: Optional[str] = ""

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    assignee_id: Optional[str] = ""
    assignee_name: Optional[str] = ""
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    project_id: Optional[str] = None
    created_by: Optional[str] = ""
    dependencies: List[TaskDependency] = []
    time_entries: List[TimeEntry] = []
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    template_id: Optional[str] = None
    tags: List[str] = []

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: TaskPriority = TaskPriority.medium
    assignee_id: Optional[str] = ""
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    dependencies: List[TaskDependency] = []
    estimated_hours: Optional[float] = None
    template_id: Optional[str] = None
    tags: List[str] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    dependencies: Optional[List[TaskDependency]] = None
    estimated_hours: Optional[float] = None
    tags: Optional[List[str]] = None

class TaskTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    title_template: str
    description_template: Optional[str] = ""
    priority: TaskPriority = TaskPriority.medium
    estimated_hours: Optional[float] = None
    tags: List[str] = []
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = 0
    category: Optional[str] = ""

class TaskTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    title_template: str
    description_template: Optional[str] = ""
    priority: TaskPriority = TaskPriority.medium
    estimated_hours: Optional[float] = None
    tags: List[str] = []
    category: Optional[str] = ""

class TaskComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    user_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None

class TaskCommentCreate(BaseModel):
    content: str

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    status: ProjectStatus = ProjectStatus.planning
    manager_id: Optional[str] = ""
    manager_name: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    task_count: int = 0
    completed_tasks: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    manager_id: Optional[str] = ""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    manager_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class ActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    activity_type: ActivityType
    entity_type: str  # task, project, comment
    entity_id: str
    entity_name: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    project_id: Optional[str] = None

class BulkTaskCreate(BaseModel):
    tasks: List[TaskCreate]

class TimeTrackingStart(BaseModel):
    description: Optional[str] = ""

class TimeTrackingEnd(BaseModel):
    description: Optional[str] = ""

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except jwt.PyJWTError:
        return None
    
    user = await db.users.find_one({"id": user_id})
    return User(**user) if user else None

async def log_activity(user_id: str, user_name: str, activity_type: ActivityType, 
                      entity_type: str, entity_id: str, entity_name: str, 
                      description: str, project_id: Optional[str] = None):
    activity = ActivityLog(
        user_id=user_id,
        user_name=user_name,
        activity_type=activity_type,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        description=description,
        project_id=project_id
    )
    await db.activity_logs.insert_one(activity.dict())

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Techno Tower Advanced Task Management System v2.0"}

# Authentication endpoints
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    user = User(**user_dict)
    
    # Store user with hashed password
    user_to_store = user.dict()
    user_to_store["password"] = hashed_password
    await db.users.insert_one(user_to_store)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.dict()
    }

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(login_data: UserLogin):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="User account is disabled")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_obj = User(**user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj.dict()
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

# User management endpoints
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    if not current_user or current_user.role not in [UserRole.admin, UserRole.manager]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user)

# Task Template endpoints
@api_router.post("/templates", response_model=TaskTemplate)
async def create_task_template(template_data: TaskTemplateCreate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    template_dict = template_data.dict()
    template_dict["created_by"] = current_user.id
    template = TaskTemplate(**template_dict)
    
    await db.task_templates.insert_one(template.dict())
    return template

@api_router.get("/templates", response_model=List[TaskTemplate])
async def get_task_templates():
    templates = await db.task_templates.find().sort("created_at", -1).to_list(1000)
    return [TaskTemplate(**template) for template in templates]

@api_router.post("/templates/{template_id}/use", response_model=Task)
async def use_task_template(template_id: str, task_data: dict, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    template = await db.task_templates.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create task from template
    task_dict = {
        "title": template["title_template"],
        "description": template["description_template"],
        "priority": template["priority"],
        "estimated_hours": template.get("estimated_hours"),
        "tags": template["tags"],
        "template_id": template_id,
        "created_by": current_user.id,
        **task_data  # Override with provided data
    }
    
    # Get assignee name
    if task_dict.get("assignee_id"):
        assignee = await db.users.find_one({"id": task_dict["assignee_id"]})
        task_dict["assignee_name"] = assignee["full_name"] if assignee else ""
    
    task = Task(**task_dict)
    
    # Update project task count if applicable
    if task.project_id:
        await db.projects.update_one(
            {"id": task.project_id},
            {"$inc": {"task_count": 1}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    await db.tasks.insert_one(task.dict())
    
    # Update template usage count
    await db.task_templates.update_one(
        {"id": template_id},
        {"$inc": {"usage_count": 1}}
    )
    
    # Log activity
    await log_activity(
        current_user.id, current_user.full_name, ActivityType.template_used,
        "task", task.id, task.title, f"Created task from template: {template['name']}",
        task.project_id
    )
    
    return task

# Enhanced Task endpoints
@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task_dict = task_data.dict()
    task_dict["created_by"] = current_user.id
    
    # Get assignee name
    if task_dict.get("assignee_id"):
        assignee = await db.users.find_one({"id": task_dict["assignee_id"]})
        task_dict["assignee_name"] = assignee["full_name"] if assignee else ""
    
    task = Task(**task_dict)
    
    # Check dependencies
    for dep in task.dependencies:
        dep_task = await db.tasks.find_one({"id": dep.task_id})
        if not dep_task:
            raise HTTPException(status_code=400, detail=f"Dependency task {dep.task_id} not found")
    
    # Update project task count if applicable
    if task.project_id:
        await db.projects.update_one(
            {"id": task.project_id},
            {"$inc": {"task_count": 1}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    await db.tasks.insert_one(task.dict())
    
    # Log activity
    await log_activity(
        current_user.id, current_user.full_name, ActivityType.task_created,
        "task", task.id, task.title, f"Created new task", task.project_id
    )
    
    return task

@api_router.post("/tasks/bulk", response_model=List[Task])
async def create_bulk_tasks(bulk_data: BulkTaskCreate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    created_tasks = []
    
    for task_data in bulk_data.tasks:
        task_dict = task_data.dict()
        task_dict["created_by"] = current_user.id
        
        # Get assignee name
        if task_dict.get("assignee_id"):
            assignee = await db.users.find_one({"id": task_dict["assignee_id"]})
            task_dict["assignee_name"] = assignee["full_name"] if assignee else ""
        
        task = Task(**task_dict)
        
        # Update project task count if applicable
        if task.project_id:
            await db.projects.update_one(
                {"id": task.project_id},
                {"$inc": {"task_count": 1}, "$set": {"updated_at": datetime.utcnow()}}
            )
        
        await db.tasks.insert_one(task.dict())
        created_tasks.append(task)
        
        # Log activity
        await log_activity(
            current_user.id, current_user.full_name, ActivityType.task_created,
            "task", task.id, task.title, f"Created task via bulk operation", task.project_id
        )
    
    return created_tasks

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, assignee_id: Optional[str] = None, 
                   status: Optional[TaskStatus] = None, priority: Optional[TaskPriority] = None):
    filter_query = {}
    
    if project_id:
        filter_query["project_id"] = project_id
    else:
        # For independent tasks, get only tasks without project_id
        filter_query["$or"] = [{"project_id": None}, {"project_id": ""}]
    
    if assignee_id:
        filter_query["assignee_id"] = assignee_id
    if status:
        filter_query["status"] = status
    if priority:
        filter_query["priority"] = priority
    
    tasks = await db.tasks.find(filter_query).sort("created_at", -1).to_list(1000)
    return [Task(**task) for task in tasks]

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**task)

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get existing task
    existing_task = await db.tasks.find_one({"id": task_id})
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Prepare update data
    update_data = {k: v for k, v in task_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Get assignee name if assignee changed
    if "assignee_id" in update_data and update_data["assignee_id"]:
        assignee = await db.users.find_one({"id": update_data["assignee_id"]})
        update_data["assignee_name"] = assignee["full_name"] if assignee else ""
    
    # Check if status changed to completed
    status_changed_to_completed = (
        "status" in update_data and 
        update_data["status"] == TaskStatus.completed and 
        existing_task.get("status") != TaskStatus.completed
    )
    
    # Update task
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    
    # Update project completed task count if status changed to completed
    if status_changed_to_completed and existing_task.get("project_id"):
        await db.projects.update_one(
            {"id": existing_task["project_id"]},
            {"$inc": {"completed_tasks": 1}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    # Get updated task
    updated_task = await db.tasks.find_one({"id": task_id})
    
    # Log activity
    activity_desc = "Updated task"
    if status_changed_to_completed:
        activity_desc = "Marked task as completed"
        activity_type = ActivityType.task_completed
    else:
        activity_type = ActivityType.task_updated
    
    await log_activity(
        current_user.id, current_user.full_name, activity_type,
        "task", task_id, updated_task["title"], activity_desc, updated_task.get("project_id")
    )
    
    return Task(**updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete task comments
    await db.task_comments.delete_many({"task_id": task_id})
    
    # If task was assigned to a project, decrement project task count
    if task.get("project_id"):
        updates = {"$inc": {"task_count": -1}, "$set": {"updated_at": datetime.utcnow()}}
        if task.get("status") == "completed":
            updates["$inc"]["completed_tasks"] = -1
        
        await db.projects.update_one({"id": task["project_id"]}, updates)
    
    await db.tasks.delete_one({"id": task_id})
    return {"message": "Task deleted successfully"}

# Time tracking endpoints
@api_router.post("/tasks/{task_id}/time/start")
async def start_time_tracking(task_id: str, time_data: TimeTrackingStart, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if there's already an active time entry
    if task.get("time_entries"):
        for entry in task["time_entries"]:
            if not entry.get("end_time"):
                raise HTTPException(status_code=400, detail="Time tracking already active for this task")
    
    # Create new time entry
    time_entry = TimeEntry(
        start_time=datetime.utcnow(),
        description=time_data.description
    )
    
    await db.tasks.update_one(
        {"id": task_id},
        {"$push": {"time_entries": time_entry.dict()}, "$set": {"status": "in_progress", "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Time tracking started", "time_entry": time_entry}

@api_router.post("/tasks/{task_id}/time/stop")
async def stop_time_tracking(task_id: str, time_data: TimeTrackingEnd, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Find active time entry
    time_entries = task.get("time_entries", [])
    active_entry_index = None
    
    for i, entry in enumerate(time_entries):
        if not entry.get("end_time"):
            active_entry_index = i
            break
    
    if active_entry_index is None:
        raise HTTPException(status_code=400, detail="No active time tracking found")
    
    # Update time entry
    end_time = datetime.utcnow()
    start_time = datetime.fromisoformat(time_entries[active_entry_index]["start_time"].replace('Z', '+00:00'))
    duration_minutes = int((end_time - start_time).total_seconds() / 60)
    
    time_entries[active_entry_index]["end_time"] = end_time
    time_entries[active_entry_index]["duration_minutes"] = duration_minutes
    if time_data.description:
        time_entries[active_entry_index]["description"] = time_data.description
    
    # Calculate total actual hours
    total_minutes = sum(entry.get("duration_minutes", 0) for entry in time_entries if entry.get("duration_minutes"))
    actual_hours = total_minutes / 60
    
    await db.tasks.update_one(
        {"id": task_id},
        {
            "$set": {
                "time_entries": time_entries,
                "actual_hours": actual_hours,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Time tracking stopped", "duration_minutes": duration_minutes, "total_hours": actual_hours}

# Task Comments endpoints
@api_router.post("/tasks/{task_id}/comments", response_model=TaskComment)
async def add_task_comment(task_id: str, comment_data: TaskCommentCreate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        content=comment_data.content
    )
    
    await db.task_comments.insert_one(comment.dict())
    
    # Log activity
    await log_activity(
        current_user.id, current_user.full_name, ActivityType.comment_added,
        "comment", comment.id, f"Comment on {task['title']}", f"Added comment to task", task.get("project_id")
    )
    
    return comment

@api_router.get("/tasks/{task_id}/comments", response_model=List[TaskComment])
async def get_task_comments(task_id: str):
    comments = await db.task_comments.find({"task_id": task_id}).sort("created_at", 1).to_list(1000)
    return [TaskComment(**comment) for comment in comments]

# Enhanced Project endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    project_dict = project_data.dict()
    
    # Get manager name
    if project_dict.get("manager_id"):
        manager = await db.users.find_one({"id": project_dict["manager_id"]})
        project_dict["manager_name"] = manager["full_name"] if manager else ""
    
    project = Project(**project_dict)
    await db.projects.insert_one(project.dict())
    
    # Log activity
    await log_activity(
        current_user.id, current_user.full_name, ActivityType.project_created,
        "project", project.id, project.name, f"Created new project", project.id
    )
    
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects(manager_id: Optional[str] = None, status: Optional[ProjectStatus] = None):
    filter_query = {}
    if manager_id:
        filter_query["manager_id"] = manager_id
    if status:
        filter_query["status"] = status
    
    projects = await db.projects.find(filter_query).sort("created_at", -1).to_list(1000)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate, current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    existing_project = await db.projects.find_one({"id": project_id})
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Get manager name if manager changed
    if "manager_id" in update_data and update_data["manager_id"]:
        manager = await db.users.find_one({"id": update_data["manager_id"]})
        update_data["manager_name"] = manager["full_name"] if manager else ""
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated_project = await db.projects.find_one({"id": project_id})
    return Project(**updated_project)

# Activity Feed endpoints
@api_router.get("/activities", response_model=List[ActivityLog])
async def get_activities(project_id: Optional[str] = None, limit: int = 50):
    filter_query = {}
    if project_id:
        filter_query["project_id"] = project_id
    
    activities = await db.activity_logs.find(filter_query).sort("created_at", -1).limit(limit).to_list(limit)
    return [ActivityLog(**activity) for activity in activities]

@api_router.get("/activities/user/{user_id}", response_model=List[ActivityLog])
async def get_user_activities(user_id: str, limit: int = 50):
    activities = await db.activity_logs.find({"user_id": user_id}).sort("created_at", -1).limit(limit).to_list(limit)
    return [ActivityLog(**activity) for activity in activities]

# Enhanced Stats endpoints
@api_router.get("/stats")
async def get_stats():
    # Get task stats
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"status": "completed"})
    pending_tasks = await db.tasks.count_documents({"status": "pending"})
    in_progress_tasks = await db.tasks.count_documents({"status": "in_progress"})
    blocked_tasks = await db.tasks.count_documents({"status": "blocked"})
    
    # Get project stats
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({"status": "active"})
    completed_projects = await db.projects.count_documents({"status": "completed"})
    
    # Get urgent tasks
    urgent_tasks = await db.tasks.count_documents({"priority": "urgent", "status": {"$ne": "completed"}})
    
    # Get user stats
    total_users = await db.users.count_documents({"is_active": True})
    
    # Get template stats
    total_templates = await db.task_templates.count_documents({})
    
    # Calculate productivity metrics
    tasks_with_time = await db.tasks.find({"actual_hours": {"$exists": True, "$gt": 0}}).to_list(1000)
    avg_completion_time = 0
    if tasks_with_time:
        total_hours = sum(task.get("actual_hours", 0) for task in tasks_with_time)
        avg_completion_time = total_hours / len(tasks_with_time)
    
    return {
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "in_progress": in_progress_tasks,
            "blocked": blocked_tasks,
            "urgent": urgent_tasks
        },
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": completed_projects
        },
        "users": {
            "total": total_users
        },
        "templates": {
            "total": total_templates
        },
        "productivity": {
            "avg_completion_time_hours": round(avg_completion_time, 2),
            "tasks_with_time_tracking": len(tasks_with_time)
        }
    }

@api_router.get("/stats/team")
async def get_team_stats(current_user: User = Depends(get_current_user)):
    if not current_user or current_user.role not in [UserRole.admin, UserRole.manager]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get team productivity stats
    users = await db.users.find({"is_active": True}).to_list(1000)
    team_stats = []
    
    for user in users:
        user_tasks = await db.tasks.count_documents({"assignee_id": user["id"]})
        completed_tasks = await db.tasks.count_documents({"assignee_id": user["id"], "status": "completed"})
        
        # Calculate average completion time
        user_completed_tasks = await db.tasks.find({
            "assignee_id": user["id"], 
            "status": "completed",
            "actual_hours": {"$exists": True, "$gt": 0}
        }).to_list(1000)
        
        avg_time = 0
        if user_completed_tasks:
            total_hours = sum(task.get("actual_hours", 0) for task in user_completed_tasks)
            avg_time = total_hours / len(user_completed_tasks)
        
        team_stats.append({
            "user_id": user["id"],
            "user_name": user["full_name"],
            "role": user["role"],
            "total_tasks": user_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round((completed_tasks / user_tasks * 100) if user_tasks > 0 else 0, 1),
            "avg_completion_time_hours": round(avg_time, 2)
        })
    
    return {"team_stats": team_stats}

# Project tasks endpoints (enhanced)
@api_router.get("/projects/{project_id}/tasks", response_model=List[Task])
async def get_project_tasks(project_id: str, status: Optional[TaskStatus] = None, assignee_id: Optional[str] = None):
    # Verify project exists
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    filter_query = {"project_id": project_id}
    if status:
        filter_query["status"] = status
    if assignee_id:
        filter_query["assignee_id"] = assignee_id
    
    tasks = await db.tasks.find(filter_query).sort("created_at", -1).to_list(1000)
    return [Task(**task) for task in tasks]

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    if not current_user or current_user.role not in [UserRole.admin, UserRole.manager]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete all tasks associated with this project
    await db.tasks.delete_many({"project_id": project_id})
    
    # Delete all comments for project tasks
    project_tasks = await db.tasks.find({"project_id": project_id}).to_list(1000)
    task_ids = [task["id"] for task in project_tasks]
    await db.task_comments.delete_many({"task_id": {"$in": task_ids}})
    
    # Delete the project
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project and associated data deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()