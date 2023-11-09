# models > user.py


from sqlalchemy import *
from sqlalchemy.orm import *
from datetime import datetime, timedelta, timezone
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
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    email = Column(String(120), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    sample = Column(Boolean, nullable=False, default=False)
    admin = Column(Boolean, nullable=False, default=False)
    master = Column(Boolean, nullable=False, default=False)
    date_added = Column(DateTime, default=datetime.now(timezone(timedelta(hours=9), 'JST')))

    # Users to Servers [many to many]
    servers = relationship(
        'Server',
        secondary=user_server_map_table,
        back_populates='users',
    )

    # User to Servers [one to many]  
    own_servers = relationship('Server', backref='owner', lazy=True, cascade='all, delete-orphan')
    # User to Messages [one to many] 
    messages = relationship('Message', backref='sender', lazy=True, cascade='all, delete-orphan')
    # User to File [one to one]
    image = relationship('File', backref='user', lazy=True, cascade='all, delete-orphan', uselist=False)


    def __repr__(self):
        return '<Name %r>' % self.name

    @property
    def className(self):
        return 'User'

    @property
    def password(self):
        raise AttributeError('Password is not hashed.')

    @password.setter
    def password(self, psw):
        self.hashed_password = generate_password_hash(psw)

    def verify_password(self, psw):
        return check_password_hash(self.hashed_password, psw)



class Server(db.Model):
    __tablename__ = 'server'

    id = Column(Integer, primary_key=True)
    name = Column(String(30), unique=True)
    date_added = Column(String, nullable=False) # ajax内で生成した日付を付与

    # Servers to Users [many to many]
    users = relationship(
        'User',
        secondary=user_server_map_table,
        back_populates='servers',
    )
    # Servers to User(Owner) [many to one]
    owner_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    # Server to Channels [one to many]
    channels = relationship('Channel', backref='server', lazy=True, cascade='all, delete-orphan')
    # Server to File [one to one]
    image = relationship('File', backref='server', lazy=True, cascade='all, delete-orphan', uselist=False)

    def __repr__(self):
        return '<Name %r>' % self.name
    
    @property
    def className(self):
        return 'Server'



class Channel(db.Model):
    __tablename__ = 'channel'

    id = Column(Integer, primary_key=True)
    name = Column(String(30), nullable=False)
    date_added = Column(String, nullable=False) # ajax内で生成した日付を付与

    # Channels to Server [many to one]  
    server_id = Column(Integer, ForeignKey('server.id'), nullable=False)
    # Channels to Messages [one to many]  
    messages = relationship('Message', backref='channel', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return '<Name %r>' % self.name

    @property
    def className(self):
        return 'Channel'



class Message(db.Model):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True)
    content = Column(String(100))
    date_added = Column(String, nullable=False) # ajax内で生成した日付を付与

    # Messages to Channel [many to one]
    channel_id = Column(Integer, ForeignKey('channel.id'), nullable=False)
    # Messages to User [many to one]
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    # Message to Files [one to many]
    files = relationship('File', backref='message', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return '<Posted date %r>' % self.date_added

    @property
    def className(self):
        return 'Message'

    @property
    def dateToMin(self):
        return self.date_added.rsplit(':', 1)[0]

    @property
    def dateToDay(self):
        return self.date_added.split(' ', 1)[0]



class File(db.Model):
    __tablename__ = 'file'

    id = Column(Integer, primary_key=True)
    name = Column(String(100))

    # File to User [one to one]
    user_id = Column(Integer, ForeignKey('user.id'))
    # File to Server [one to one]
    server_id = Column(Integer, ForeignKey('server.id'))
    # Channels to Server [many to one]
    message_id = Column(Integer, ForeignKey('message.id'))

    def __repr__(self):
        return '<Name %r>' % self.name

    @property
    def className(self):
        return 'File'