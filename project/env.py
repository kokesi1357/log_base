# env.py

import os

def is_production():
    return True if os.environ.get('APP_SETTINGS') == 'project.config.ProductionConfig' else False