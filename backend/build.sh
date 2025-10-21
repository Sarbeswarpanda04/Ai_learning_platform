#!/bin/bash
# Build script for Render deployment

echo "Installing dependencies..."
pip install -r requirements.txt
pip install -r requirements-prod.txt

echo "Running database migrations..."
python migrate_add_email_verified.py

echo "Initializing database..."
python init_db.py

echo "Build complete!"
