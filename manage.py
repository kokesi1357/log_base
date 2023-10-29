# manage.py

import os
from flask.cli import AppGroup
from project.app import app, db
from project.boto3 import s3
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

@manager_cli.command('create_sample_user')
def create_master():
    """Creates a sample user."""
    db.session.add(
        User(
            name="ken",
            email="k@k.com",
            password="kkkkkkkk")
    )
    db.session.commit()


@manager_cli.command('create_testuser')
def create_user():
    """Creates a sample user and its surroundings."""
    u = User(name="kenken", email="k@k.com", password="kkkkkkkk")
    db.session.add(u)
    # db.session.commit()
    u2 = User(name="kentest", email="k@kk.com", password="kkkkkkkk")
    db.session.add(u2)
    db.session.commit()

    u = User.query.filter_by(name="kenken").first()
    u.own_servers = [Server(name="kenserver", owner_id=u.id, channels=[
                        Channel(name="channel1", messages=[
                            Message(content="content1", user_id=u.id, files=[
                                File(name="hey")
                            ])
                        ])
                    ])
                ]
    db.session.commit()

    u2.servers.append(u.own_servers[0])
    db.session.commit()


import random

@manager_cli.command('add_msg')
def add_msg():
    channel = Channel.query.filter_by(id=1).first()
    channel.messages.append(
        Message(content=str(random.randrange(100000)), user_id=3)
    )
    db.session.commit()

    print("-----------")
    print(channel.messages)
    print("-----------")



app.cli.add_command(manager_cli)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)