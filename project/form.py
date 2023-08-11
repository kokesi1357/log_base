from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, \
    BooleanField, SubmitField, FileField, TextAreaField
from wtforms.validators import ValidationError, StopValidation, \
    DataRequired, Length, Email, EqualTo
from project.models.models import User, Server, Channel, Message, File




# Validation classes---------------------------------------

# Length
class ValidateLength(Length):
    def __init__(self, min, max):
        super().__init__(
            min=min,
            max=max,
            message=f"*Must be {min} - {max} characters long.")


# Required
class ValidateRequired(DataRequired):
    def __init__(self, type):
        super().__init__( message=f"*{type} is required." )


# Email
class ValidateEmail(Email):
    def __init__(self):
        super().__init__( message="*Invalid address (e.g email@address.com)." )


# Equality
class ValidateEqual(EqualTo):
    def __init__(self, type):
        super().__init__(
            fieldname=type,
            message=f"*Must match the {type} field.")


# Data uniqueness
class ValidateUnique(object):
    def __init__(self, type, class_name, class_member, data_id=None):
        self.message = f"*The {type} has alerady been registered."
        self.class_name = class_name
        self.class_member = class_member
        self.data_id = data_id

    def __call__(self, form, field):
        existing_data = None
        if self.class_name == "user":
            existing_data = User.query.filter(self.class_member==field.data).first()
        if self.class_name == "server":
            existing_data = Server.query.filter(self.class_member==field.data).first()

        if existing_data and (self.data_id == None or existing_data.id != self.data_id):
            raise ValidationError(self.message)


# Non existing user (unregistered or non-admin)
class ValidateNonExisting(object):
    def __init__(self, type, class_member, lgin_type=None):
        self.message = f"* User with this {type} doesn\'t exist."
        self.class_member = class_member
        self.lgin_type = lgin_type

    def __call__(self, form, field):
        user = User.query.filter(self.class_member==field.data).first()
        if user == None or (self.lgin_type == "user" and user.admin):
            raise ValidationError(self.message)


class ValidateFileFormat(object):
    def __init__(self, type, class_member, lgin_type=None):
        self.message = f"* User with this {type} doesn\'t exist."
        self.class_member = class_member
        self.lgin_type = lgin_type


# Non validation class
class Pass(object):
    def __call__(self, *args, **kwds):
        pass




# Field classes --------------------------------------------

class MyStringField(StringField):
    def __init__(self, label, validators, **kwargs):
        super(MyStringField, self).__init__(label, validators, **kwargs)
        self.pre_validators = validators

    def nullify_validators(self):
        self.validators = [Pass()]

    def activate_validators(self):
        self.validators = self.pre_validators


class MyPasswordField(PasswordField):
    def __init__(self, label, validators, **kwargs):
        super(MyPasswordField, self).__init__(label, validators, **kwargs)
        self.pre_validators = validators

    def nullify_validators(self):
        self.validators = [Pass()]

    def activate_validators(self):
        self.validators = self.pre_validators




# Form classes --------------------------------------------

# Base
class Form(FlaskForm):
    submit = SubmitField('Submit')

    def is_valid(self, type):
        result = 0
        if  (self[type].errors):
                result = 1
        return result


# User
def user_form(prop=None, rgstr=False, user_id=None, lgin_type=False): 
    class UserForm(Form):
        def __repr__(self):
            return 'UserForm'
        # pass
    
    if 'name' in prop:
        validate_unique = ValidateUnique('nickname', "user", User.name, user_id) if rgstr else Pass()
        UserForm.name = MyStringField('Nickname', [
            ValidateRequired('Nickname'),
            ValidateLength(3, 100),
            validate_unique])

    if 'email' in prop:
        validate_unique = ValidateUnique('email', User.email, user_id) if rgstr else Pass()
        validate_non_existing = ValidateNonExisting('email', User.email, lgin_type) if lgin_type else Pass()
        UserForm.email = EmailField('Email', [
            ValidateRequired('Email'),
            ValidateLength(3, 120),
            ValidateEmail(),
            validate_unique,
            validate_non_existing])

    if 'psw' in prop:
        UserForm.psw = PasswordField('Password', [
            ValidateRequired('Password'),
            ValidateLength(8, 100)])

    if 'psw_conf' in prop:
        UserForm.psw = MyPasswordField('Password', [
            ValidateRequired('Password'),
            ValidateLength(8, 100),
            ValidateEqual('conf')])

        UserForm.conf  = PasswordField('Confirm Password')

    # Adminのユーザー編集でパスワード以外を変更したい場合に使用します
    if 'psw_disabled' in prop:
        UserForm.psw_disabled = BooleanField('No change of password')

    if 'admin' in prop:
        UserForm.admin = BooleanField('Admin')

    return UserForm()


# Server
def server_form(server_id=None):
    class ServerForm(Form):
        def __repr__(self):
            return 'ServerForm'
        # pass

    validate_unique = ValidateUnique('name', "server", Server.name, server_id)
    ServerForm.name = StringField('Name', [
        ValidateRequired('Name'),
        ValidateLength(3, 100),
        validate_unique])

    ServerForm.image = FileField('Image')

    return ServerForm()


# def channel_form(prop=None, rgstr=False, user_id=None, lgin_type=False): 
#     class StaticForm(Form):
#         pass
    
#     if 'name' in prop:
#         validate_unique = ValidateUnique('nickname', User.name, user_id) if rgstr else Pass()
#         StaticForm.name = MyStringField('Nickname', [
#             ValidateRequired('Nickname'),
#             ValidateLength(3, 100),
#             validate_unique])

#     if 'email' in prop:
#         validate_unique = ValidateUnique('email', User.email, user_id) if rgstr else Pass()
#         validate_non_existing = ValidateNonExisting('email', User.email, lgin_type) if lgin_type else Pass()
#         StaticForm.email = EmailField('Email', [
#             ValidateRequired('Email'),
#             ValidateLength(3, 120),
#             ValidateEmail(),
#             validate_unique,
#             validate_non_existing])

#     if 'psw' in prop:
#         StaticForm.psw = PasswordField('Password', [
#             ValidateRequired('Password'),
#             ValidateLength(8, 100)])

#     if 'psw_conf' in prop:
#         StaticForm.psw = MyPasswordField('Password', [
#             ValidateRequired('Password'),
#             ValidateLength(8, 100),
#             ValidateEqual('conf')])

#         StaticForm.conf  = PasswordField('Confirm Password')

#     # Adminのユーザー編集でパスワード以外を変更したい場合に使用します
#     if 'psw_disabled' in prop:
#         StaticForm.psw_disabled = BooleanField('No change of password')

#     if 'admin' in prop:
#         StaticForm.admin = BooleanField('Admin')

#     return StaticForm()


# def message_form(prop=None, rgstr=False, user_id=None, lgin_type=False): 
#     class StaticForm(Form):
#         pass
    
#     if 'name' in prop:
#         validate_unique = ValidateUnique('nickname', User.name, user_id) if rgstr else Pass()
#         StaticForm.name = MyStringField('Nickname', [
#             ValidateRequired('Nickname'),
#             ValidateLength(3, 100),
#             validate_unique])

#     if 'email' in prop:
#         validate_unique = ValidateUnique('email', User.email, user_id) if rgstr else Pass()
#         validate_non_existing = ValidateNonExisting('email', User.email, lgin_type) if lgin_type else Pass()
#         StaticForm.email = EmailField('Email', [
#             ValidateRequired('Email'),
#             ValidateLength(3, 120),
#             ValidateEmail(),
#             validate_unique,
#             validate_non_existing])

#     if 'psw' in prop:
#         StaticForm.psw = PasswordField('Password', [
#             ValidateRequired('Password'),
#             ValidateLength(8, 100)])

#     if 'psw_conf' in prop:
#         StaticForm.psw = MyPasswordField('Password', [
#             ValidateRequired('Password'),
#             ValidateLength(8, 100),
#             ValidateEqual('conf')])

#         StaticForm.conf  = PasswordField('Confirm Password')

#     # Adminのユーザー編集でパスワード以外を変更したい場合に使用します
#     if 'psw_disabled' in prop:
#         StaticForm.psw_disabled = BooleanField('No change of password')

#     if 'admin' in prop:
#         StaticForm.admin = BooleanField('Admin')

#     return StaticForm()