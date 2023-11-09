# manage.py

import os
from flask.cli import AppGroup
from project.app import app, db
from project.env import is_production
from project.boto3 import s3_delete_obj
from project.models.models import User, Server, Channel, Message, File


manager_cli = AppGroup('manager')


@manager_cli.command('create_db')
def create_db():
    """Creates the db tables."""
    db.create_all()


@manager_cli.command('drop_db')
def drop_db():
    """Drops the db tables."""
    # files = File.query.order_by(File.date_added)
    files = db.session.query(File).all()
    for f in files:
        print('--------')
        print(f.name)
    #     s3_delete_obj(f.name)
    # db.drop_all()


@manager_cli.command('create_master')
def create_master():
    """Creates a master user."""
    db.session.add(
        User(
            email=os.environ['MASTER_EMAIL'],
            password=os.environ['MASTER_PASSWORD'],
            admin=True,
            master=True)
    )
    db.session.commit()


app.cli.add_command(manager_cli)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)