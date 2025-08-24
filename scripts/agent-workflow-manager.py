#!/usr/bin/env python3
"""
ESM Platform - Agent Workflow Manager
Orchestrates parallel development tasks using specialized agents
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path
from datetime import datetime

class AgentWorkflowManager:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.agents_dir = self.project_root / '.claude' / 'agents'
        self.scripts_dir = self.project_root / 'scripts'
        self.worktrees_dir = self.project_root.parent
        
        # Agent configuration
        self.agents = {
            'database-expert': {
                'directory': self.worktrees_dir / 'esm-database',
                'branch': 'feature/database-implementation',
                'focus': 'PostgreSQL setup and optimization',
                'priority': 1
            },
            'migration-specialist': {
                'directory': self.worktrees_dir / 'esm-migration', 
                'branch': 'feature/migration-utilities',
                'focus': 'Data migration and validation',
                'priority': 2
            },
            'frontend-specialist': {
                'directory': self.worktrees_dir / 'esm-frontend',
                'branch': 'feature/ui-integration', 
                'focus': 'Application integration',
                'priority': 3
            },
            'documentation-specialist': {
                'directory': self.worktrees_dir / 'esm-docs',
                'branch': 'feature/documentation-update',
                'focus': 'Administrator guides',
                'priority': 4
            },
            'testing-specialist': {
                'directory': self.worktrees_dir / 'esm-testing',
                'branch': 'feature/integration-testing',
                'focus': 'Quality assurance',
                'priority': 5
            }
        }

    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"ESM Platform - {title}")
        print(f"{'='*60}")

    def print_status(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        symbols = {"INFO": "ℹ", "SUCCESS": "✓", "WARNING": "⚠", "ERROR": "✗"}
        symbol = symbols.get(level, "ℹ")
        print(f"[{timestamp}] {symbol} {message}")

    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        self.print_header("Prerequisites Check")
        
        # Check project files
        required_files = [
            'PROJECT_CONTEXT.md',
            'NEXT_SESSION_BRIEFING.md', 
            'database/schema.sql',
            'lib/migration-utils.ts'
        ]
        
        for file_path in required_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                self.print_status(f"Found: {file_path}", "SUCCESS")
            else:
                self.print_status(f"Missing: {file_path}", "ERROR")
                return False

        # Check git repository
        if (self.project_root / '.git').exists():
            self.print_status("Git repository detected", "SUCCESS")
        else:
            self.print_status("No git repository found", "WARNING")

        # Check node modules
        if (self.project_root / 'node_modules').exists():
            self.print_status("Node modules installed", "SUCCESS")
        else:
            self.print_status("Node modules missing - run npm install", "WARNING")

        return True

    def setup_worktrees(self):
        """Set up git worktrees for parallel development"""
        self.print_header("Git Worktrees Setup")
        
        os.chdir(self.project_root)
        
        for agent_name, config in self.agents.items():
            worktree_path = config['directory']
            branch_name = config['branch']
            
            # Check if worktree already exists
            if worktree_path.exists():
                self.print_status(f"Worktree already exists: {agent_name}", "WARNING")
                continue
                
            try:
                # Create branch if it doesn't exist
                result = subprocess.run(['git', 'branch', branch_name], 
                                      capture_output=True, text=True)
                
                # Add worktree
                result = subprocess.run(['git', 'worktree', 'add', str(worktree_path), branch_name],
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    self.print_status(f"Created worktree: {agent_name} → {worktree_path}", "SUCCESS")
                else:
                    self.print_status(f"Failed to create worktree: {agent_name}", "ERROR")
                    
            except Exception as e:
                self.print_status(f"Error creating worktree {agent_name}: {e}", "ERROR")

    def generate_agent_tasks(self):
        """Generate task recommendations for each agent"""
        self.print_header("Agent Task Recommendations")
        
        tasks = {
            'database-expert': [
                "Install and configure local PostgreSQL instance",
                "Deploy database schema from schema.sql",
                "Test database connection and validate all tables",
                "Create database performance optimization plan",
                "Set up backup and recovery procedures"
            ],
            'migration-specialist': [
                "Locate June 2025 spreadsheet file",
                "Test migration utilities with real data",
                "Validate all 245 users import correctly", 
                "Verify all 16 services access records",
                "Generate comprehensive migration report"
            ],
            'frontend-specialist': [
                "Replace mock data with database services",
                "Update components to use lib/db-services.ts",
                "Test UI with real database connections",
                "Validate dashboard metrics show real data",
                "Optimize frontend performance"
            ],
            'documentation-specialist': [
                "Create administrator procedures guide",
                "Document backup and recovery procedures", 
                "Create troubleshooting guide for IT team",
                "Prepare user training materials",
                "Update technical documentation"
            ],
            'testing-specialist': [
                "Create comprehensive test suite",
                "Validate migration data integrity",
                "Performance testing with 300+ users",
                "Security testing and validation",
                "Prepare deployment checklist"
            ]
        }
        
        for agent_name, task_list in tasks.items():
            print(f"\n🤖 {agent_name.upper()}")
            print(f"Focus: {self.agents[agent_name]['focus']}")
            print(f"Directory: {self.agents[agent_name]['directory']}")
            print("Tasks:")
            for i, task in enumerate(task_list, 1):
                print(f"  {i}. {task}")

    def create_session_script(self):
        """Create a master session coordination script"""
        self.print_header("Session Coordination Script")
        
        script_content = '''#!/bin/bash
# ESM Platform - Master Session Coordinator
# Orchestrates parallel agent workflows

echo "========================================"
echo "ESM Platform - Session Coordinator"
echo "========================================"

# Function to start agent session
start_agent_session() {
    local agent_name=$1
    local agent_dir=$2
    local focus=$3
    
    echo "Starting $agent_name session..."
    echo "Directory: $agent_dir"  
    echo "Focus: $focus"
    echo "----------------------------------------"
    
    # Create session log
    echo "Session started: $(date)" > "$agent_dir/SESSION_LOG.txt"
    echo "Agent: $agent_name" >> "$agent_dir/SESSION_LOG.txt"
    echo "Focus: $focus" >> "$agent_dir/SESSION_LOG.txt"
    
    # Change to agent directory
    cd "$agent_dir" || exit 1
    
    # Start specialized session
    echo "Ready for $agent_name tasks"
    echo "Use PROJECT_CONTEXT.md for full context"
    echo "See .claude/agents/$agent_name.yaml for configuration"
}

# Menu for agent selection
echo "Select specialized agent workflow:"
echo "1. Database Expert (Priority 1 - PostgreSQL setup)"
echo "2. Migration Specialist (Priority 2 - Data import)"  
echo "3. Frontend Specialist (Priority 3 - UI integration)"
echo "4. Documentation Specialist (Priority 4 - Admin guides)"
echo "5. Testing Specialist (Priority 5 - Quality assurance)"
echo "6. Parallel Mode (All agents simultaneously)"
echo ""
read -p "Select workflow (1-6): " choice

case $choice in
    1) start_agent_session "database-expert" "../esm-database" "PostgreSQL setup and optimization" ;;
    2) start_agent_session "migration-specialist" "../esm-migration" "Data migration and validation" ;;
    3) start_agent_session "frontend-specialist" "../esm-frontend" "Application integration" ;;
    4) start_agent_session "documentation-specialist" "../esm-docs" "Administrator guides" ;;
    5) start_agent_session "testing-specialist" "../esm-testing" "Quality assurance" ;;
    6) echo "Parallel mode - Open multiple terminals and run this script for each agent" ;;
    *) echo "Invalid selection" ;;
esac
'''
        
        script_path = self.scripts_dir / 'agent-coordinator.sh'
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        # Make executable
        os.chmod(script_path, 0o755)
        self.print_status(f"Created agent coordinator: {script_path}", "SUCCESS")

    def validate_setup(self):
        """Validate that all setup is complete"""
        self.print_header("Setup Validation")
        
        validation_checks = [
            ("Project context file", self.project_root / 'PROJECT_CONTEXT.md'),
            ("Session briefing", self.project_root / 'NEXT_SESSION_BRIEFING.md'),
            ("Database schema", self.project_root / 'database' / 'schema.sql'),
            ("Migration utilities", self.project_root / 'lib' / 'migration-utils.ts'),
            ("Agent configurations", self.agents_dir),
            ("Scripts directory", self.scripts_dir)
        ]
        
        all_valid = True
        for check_name, path in validation_checks:
            if path.exists():
                self.print_status(f"{check_name}: ✓", "SUCCESS")
            else:
                self.print_status(f"{check_name}: ✗", "ERROR")
                all_valid = False
        
        # Check worktrees
        for agent_name, config in self.agents.items():
            if config['directory'].exists():
                self.print_status(f"Worktree {agent_name}: ✓", "SUCCESS")
            else:
                self.print_status(f"Worktree {agent_name}: ✗", "WARNING")
        
        return all_valid

    def main(self):
        """Main workflow management function"""
        self.print_header("Agent Workflow Manager")
        print("Orchestrating parallel development for ESM Platform")
        
        # Check prerequisites
        if not self.check_prerequisites():
            self.print_status("Prerequisites check failed", "ERROR")
            return False
        
        # Setup worktrees
        self.setup_worktrees()
        
        # Generate task recommendations
        self.generate_agent_tasks()
        
        # Create session coordination script
        self.create_session_script()
        
        # Validate setup
        if self.validate_setup():
            self.print_status("All systems ready for parallel development!", "SUCCESS")
            print("\n🚀 READY FOR MAXIMUM EFFICIENCY!")
            print("Use scripts/agent-coordinator.sh to start specialized workflows")
            return True
        else:
            self.print_status("Setup validation failed", "ERROR")
            return False

if __name__ == "__main__":
    project_root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    manager = AgentWorkflowManager(project_root)
    success = manager.main()
    sys.exit(0 if success else 1)
