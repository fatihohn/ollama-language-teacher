#!/bin/bash

# python app.py
export FLASK_ENV=development  # Enables debug mode
export FLASK_APP=app.py        # Ensure the correct app file is set
export FLASK_DEBUG=1
flask run --host=0.0.0.0 --port=5000