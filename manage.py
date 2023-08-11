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


@manager_cli.command('create_user')
def create_user():
    """Creates a sample user and its surroundings."""
    # u = User(name="kenken", email="k@k.com", password="kkkkkkkk")
    # db.session.add(u)
    # db.session.commit()
    u = User(name="kentest", email="k@t.com", password="kkkkkkkk")
    db.session.add(u)
    db.session.commit()

# @manager_cli.command('create_etc')
# def create_master():
    # u = User.query.filter_by(name="kenken").first()
    # u.servers = [Server(name="kenserver", owner_id=u.id, channels=[
    #                     Channel(name="channel1", messages=[
    #                         Message(content="content1", images=[
    #                             Image(content="content2")
    #                         ])
    #                     ])
    #                 ])
    #             ]
    # db.session.commit()


@manager_cli.command('delete')
def delete():
    u = User.query.filter_by(name="kenken").first()
    s = u.own_servers[0]
    # o = s.owner
    # c = s.channels[0]
    # m = c.messages[0]
    # i = m.images[0]
    db.session.delete(u)
    # m.images.append(Image(content="content-test"))

    u2 = User.query.filter_by(name="kentest").first()
    # u2.servers.append(s)
    # db.session.delete(u2)

    db.session.commit()
    
    # img = Image.query.order_by(Image.id).first()
    print()
    print(u2.servers)
    print("hey")
    print()


@manager_cli.command('delete-u')
def delete_data():
    u = User.query.filter_by(name="kenken").first()
    db.session.delete(u)
    db.session.commit()


@manager_cli.command('test')
def test():
    u = User.query.filter_by(email="kk@k.com").first()
    # s = Server(name="kenserver", image_file_name='hey.jpg', owner_id=u.id)
    # u.own_servers.append(name="kenserver", image_file_name='hey.jpg', owner_id=u.id)
    # u.servers.append(s)
    # db.session.add(s)
    # db.session.commit()

    # servers = Server.query.order_by(Server.date_added)
    # o = u.own_servers[0]
    s = Server.query.filter_by(name="kenserver").first()

    # s = Server.query.order_by(Server.id).first()
    # db.session.delete(s)
    # db.session.commit()
    print()
    print()
    print(u.own_servers)
    print()

    #     u.servers = [Server(name=form.name.data, owner_id=u.id, channels=[
    #                         Channel(name="channel1", messages=[
    #                             Message(content="content1", images=[
    #                                 File(content="content2")
    #                             ])
    #                         ])
    #                     ])
    #                 ]


app.cli.add_command(manager_cli)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)