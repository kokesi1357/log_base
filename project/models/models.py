# models > user.py


from sqlalchemy import *
from sqlalchemy.orm import *
from datetime import datetime, timedelta
from project.app import db
from werkzeug.security import generate_password_hash, check_password_hash



# Users to Servers [many to many]
user_server_map_table = Table(
    'user_server_map',
    db.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('server_id', Integer, ForeignKey('server.id'))
)



# User class holds info of an actual user and relationships with multiple posts.
class User(db.Model):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    email = Column(String(120), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    image_file_name = Column(String(100))
    admin = Column(Boolean, nullable=False, default=False)
    master = Column(Boolean, nullable=False, default=False)
    date_added = Column(DateTime, default=datetime.utcnow() + timedelta(hours=-8))

    # Users to Servers [many to many]  
    servers = relationship(
        "Server",
        secondary=user_server_map_table,
        back_populates="users"
    )

    # User() to Servers [one to many]  
    own_servers = relationship('Server', backref='owner', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return '<Name %r>' % self.name

    @property
    def password(self):
        raise AttributeError("Password is not hashed.")

    @password.setter
    def password(self, psw):
        self.hashed_password = generate_password_hash(psw)

    def verify_password(self, psw):
        return check_password_hash(self.hashed_password, psw)



class Server(db.Model):
    __tablename__ = "server"

    id = Column(Integer, primary_key=True)
    name = Column(String(30), unique=True)
    image_file_name = Column(String(100))
    date_added = Column(DateTime, default=datetime.utcnow() + timedelta(hours=-8))

    # Servers to Users [many to many]
    users = relationship(
        "User",
        secondary=user_server_map_table,
        back_populates="servers"
    )

    # Servers to User(Owner) [many to one]
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    # Server to Channels [one to many]
    channels = relationship('Channel', backref='server', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return '<Name %r>' % self.name



class Channel(db.Model):
    __tablename__ = "channel"

    id = Column(Integer, primary_key=True)
    name = Column(String(30), nullable=False)
    date_added = Column(DateTime, default=datetime.utcnow() + timedelta(hours=-8))

    # Channels to Server [many to one]  
    server_id = Column(Integer, ForeignKey('server.id'), nullable=False)

    # Channels to Messages [one to many]  
    messages = relationship('Message', backref='channel', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return '<Name %r>' % self.name



class Message(db.Model):
    __tablename__ = "message"

    id = Column(Integer, primary_key=True)
    content = Column(String(100), nullable=False)
    date_added = Column(DateTime, default=datetime.utcnow() + timedelta(hours=-8))

    # Messages to Channel [many to one]
    channel_id = Column(Integer, ForeignKey('channel.id'), nullable=False)

    # Message to Files [one to many]
    files = relationship('File', backref='message', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return '<date %r>' % self.date_added



class File(db.Model):
    __tablename__ = "file"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    date_added = Column(DateTime, default=datetime.utcnow() + timedelta(hours=-8))

    # Channels to Server [many to one]  
    message_id = Column(Integer, ForeignKey('message.id'), nullable=False)

    def __repr__(self):
        return '<date %r>' % self.date_added