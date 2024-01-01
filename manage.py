# manage.py

import os
from flask.cli import AppGroup
from project.app import app, db
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
    db.drop_all()


@manager_cli.command('delete_s3')
def delete_s3():
    """delete all the files in the s3 storage."""
    files = db.session.query(File).all()
    for f in files:
        s3_delete_obj(f.name)


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


@manager_cli.command('post_msg')
def post_msg():
    """Creates a master user."""
    owner = User.query.filter_by(id=2).first()
    server = owner.own_servers[0]
    chnl = server.channels[0]
    sender = User.query.filter_by(id=7).first()

    db.session.add(
        Message(
            content='helloworld!',
            channel_id = chnl.id,
            date_added='2023-12-30 15:38:37',
            user_id = sender.id
        )
    )
    db.session.add(
        Message(
            content='helloworld!!!!!',
            channel_id = chnl.id,
            date_added='2023-12-30 15:38:37',
            user_id = sender.id
        )
    )
    db.session.commit()


app.cli.add_command(manager_cli)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)