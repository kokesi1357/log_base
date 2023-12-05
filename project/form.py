from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, \
    BooleanField, SubmitField, FileField, TextAreaField, MultipleFileField, HiddenField
from wtforms.validators import ValidationError, DataRequired, \
    Length, Email, EqualTo
from project.models.models import User, Server, Channel, Message, File




# Validation classes---------------------------------------

# Length
class ValidateLength(Length):
    def __init__(self, min, max):
        super().__init__(
            min=min,
            max=max,
            message=f'*Must be {min} - {max} characters long.')


# Required
class ValidateRequired(DataRequired):
    def __init__(self, type):
        super().__init__( message=f'*{type} is required.' )


# Email
class ValidateEmail(Email):
    def __init__(self):
        super().__init__( message='*Invalid address (e.g email@address.com).' )


# Equality
class ValidateEqual(EqualTo):
    def __init__(self, fieldname, repr):
        super().__init__(
            fieldname=fieldname,
            message=f'*Must match the { repr } field.')


# Data uniqueness
class ValidateUnique(object):
    def __init__(self, type, class_name, class_member, data_id=None):
        self.message = f'*The {type} has alerady been registered.'
        self.class_name = class_name
        self.class_member = class_member
        self.data_id = data_id

    def __call__(self, form, field):
        existing_data = None
        if self.class_name == 'user':
            existing_data = User.query.filter(self.class_member==field.data).first()
        elif self.class_name == 'server':
            existing_data = Server.query.filter(self.class_member==field.data).first()

        if existing_data:
            if self.data_id == None or existing_data.id != self.data_id:
                raise ValidationError(self.message)


# Non existing user (unregistered or non-admin)
class ValidateNonExisting(object):
    def __init__(self, type, class_member, lgin_type=None):
        self.message = f'* User with this {type} doesn\'t exist.'
        self.class_member = class_member
        self.lgin_type = lgin_type

    def __call__(self, form, field):
        user = User.query.filter(self.class_member==field.data).first()
        if user == None or (self.lgin_type == 'user' and user.admin):
            raise ValidationError(self.message)


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
    # 本番ではデフォで設定されているcsrf protectionをオフにしていないと、
    # ajax経由のformをvalidate()した際、必ずfalseを返す
    # form内にhidden_tag()した際、自動でcsrf
    class Meta:
        csrf = False
    submit = SubmitField('SUBMIT')

    def is_valid(self, type):
        result = 0
        if  (self[type].errors):
                result = 1
        return result


# User
# rgstr:True => unique判定, editであればuser_idを入れ自名とのunique判定は無効
def user_form(prop=None, rgstr=False, user_id=None, lgin_type=False): 
    class UserForm(Form):
        def __repr__(self):
            return 'UserForm'
    
    if 'name' in prop:
        validate_unique = ValidateUnique('nickname', 'user', User.name, user_id) if rgstr else Pass()
        UserForm.name = MyStringField('NICKNAME', [
            ValidateRequired('NICKNAME'),
            ValidateLength(3, 100),
            validate_unique])

    if 'email' in prop:
        validate_unique = ValidateUnique('email', 'user', User.email, user_id) if rgstr else Pass()
        validate_non_existing = ValidateNonExisting('email', User.email, lgin_type) if lgin_type else Pass()
        UserForm.email = EmailField('EMAIL', [
            ValidateRequired('EMAIL'),
            ValidateLength(3, 120),
            ValidateEmail(),
            validate_unique,
            validate_non_existing])

    if 'img' in prop:
        UserForm.image = FileField('IMAGE')

    if 'psw' in prop:
        UserForm.psw = PasswordField('PASSWORD', [
            ValidateRequired('PASSWORD'),
            ValidateLength(8, 100)])

    if 'psw_conf' in prop:
        UserForm.psw = MyPasswordField('PASSWORD', [
            ValidateRequired('PASSWORD'),
            ValidateLength(8, 100),
            ValidateEqual('conf', 'confirm')])

        UserForm.conf  = PasswordField('CONFIRM PASSWORD')

    if 'current_psw' in prop:
        UserForm.current_psw = PasswordField('CURRENT PASSWORD', [
            ValidateRequired('CURRENT PASSWORD'),
            ValidateLength(8, 100)])

    # Adminのユーザー編集でパスワード以外を変更したい場合に使用します
    if 'psw_disabled' in prop:
        UserForm.psw_disabled = BooleanField('NO CHANGE TO PASSWORD')

    if 'admin' in prop:
        UserForm.admin = BooleanField('ADMIN')

    if 'sample' in prop:
        UserForm.sample = BooleanField('SAMPLE')

    if 'guest' in prop:
        UserForm.guest = BooleanField('LOGIN AS GUEST')

    return UserForm()


# Server
def server_form(type=None, id=None):
    class ServerForm(Form):
        def __repr__(self):
            return 'ServerForm'

    validate_unique = ValidateUnique('name', 'server', Server.name, id)
    ServerForm.name = StringField('NAME', [
        ValidateRequired('NAME'),
        ValidateLength(3, 100),
        validate_unique])

    ServerForm.image = FileField('IMAGE')

    if type and type == 'update':
        ServerForm.delete_image = BooleanField('DELETE IMAGE')

    ServerForm.Meta.csrf = False
    return ServerForm()


# Channel
def channel_form():
    class ChannelForm(Form):
        def __repr__(self):
            return 'ChannelrForm'

    ChannelForm.name = StringField('NAME', [
        ValidateRequired('NAME'),
        ValidateLength(3, 100)])

    return ChannelForm()


# Message
def message_form(): 
    class MessageForm(Form):
        def __repr__(self):
            return 'MessageForm'

    MessageForm.content = TextAreaField('CONTENT')

    MessageForm.files = MultipleFileField()

    MessageForm.files_to_delete = StringField()

    return MessageForm()