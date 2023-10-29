# project > user > views.py

from project.app import db
from flask import Blueprint, g, request, session, flash, redirect, url_for, \
    render_template, jsonify
from functools import wraps
from time import time
from project.models.models import User, Server, Channel, Message, File
from project.form import user_form, server_form, channel_form, message_form
from project.file import standardize_filename, translate_into_s3_format, \
    allowed_file, lift_s3_format, optimize_size_unit
from project.boto3 import s3_upload_file, s3_get_body, s3_get_obj_size, \
    s3_delete_obj, s3_create_presigned_url
from project.email import send_email
from project.tokens import signup_token, psw_reset_token, decode_token
from project.base64 import translate_into_base64, decode_js_base64




# Blueprints ----------------------------------------------

user_bp = Blueprint('user', __name__,)
entry_bp = Blueprint('entry', __name__, url_prefix='/entry')
user_bp.register_blueprint(entry_bp)




# Functions for Handling Resources within This Module -------------------

# Set session for logged-in user
def set_user_session(user=None, limit=7200):
    session['user_id'] = user.id if user is not None else session['user_id']
    session['user_lifetime'] = time() + limit
    g.user = User.query.filter_by(id=session['user_id']).first()


# Clear user-related session status
def clear_user_session():
    session.pop('user_id', None)
    session.pop('auth', None)
    g.user = None


# If user lifetime and manage user-related session status
def check_user_lifetime():
    if is_user_in_session():
        if not is_user_expired():
            set_user_session()
        else:
            clear_user_session()


# Check if user is logged in
def is_user_in_session():
    if 'user_id' in session:
        return True
    return False


# Check if user lifetime is expired
def is_user_expired():
    if session['user_lifetime'] < time():
        return True
    return False


# Check if user exists
def does_user_exist():
    try:
        if g.user.id:
            return True
    except:
        return False

# Set session for authenticated user
def set_auth_session(limit=1800):
    session['auth'] = True
    session['auth_lifetime'] = time() + limit


# Check if user is authenticated for particular pages
def is_auth_in_session():
    if 'auth' in session:
        return True
    return False


# Check if authentication lifetime is expired
def is_auth_expired():
    if session['auth_lifetime'] < time():
        return True
    return False


# Check auth lifetime and manage session status only of auth
def check_auth_lifetime():
    if is_auth_in_session() and is_auth_expired():
        session.pop('auth', None)


# Change file data from s3 to a base64 format
def get_base64_from_s3(filename):
    body = s3_get_body(filename)
    img = translate_into_base64(body, filename)
    return img


# Render a template with specific keywords
def render_temp(path, title=None, form=None, **kwargs):
    u_form = user_form(['name', 'email', 'current_psw', 'psw_conf', 'img'], True) \
        if is_user_in_session() else None
    user_image = get_base64_from_s3(g.user.image_file_name) \
        if is_user_in_session() else None

    return render_template(
        path,
        title=title,
        form=form,
        user_form=u_form,
        user_image=user_image,
        g=g,
        request=request,
        **kwargs
        )


# Functions for Supporting Routing --------------------------------------
# To the top page if a user is logged in 
def is_logged_in(view):
    @wraps(view)
    def censored_view(*args, **kwargs):
        if is_user_in_session():
            return redirect(url_for('user.index'))
        return view(*args, **kwargs)
    return censored_view


# To the initial page if a user is NOT logged in
def login_required(view):
    @wraps(view)
    def censored_view(*args, **kwargs):
        if not is_user_in_session() or not does_user_exist():
            return redirect(url_for('user.entry.login'))
        return view(*args, **kwargs)
    return censored_view


# Verify if user is member of a target server
def is_user_server_member(view):
    @wraps(view)
    def censored_view(*args, **kwargs):
        try:
            if 'channel_id' in kwargs:
                server = Channel.query.filter_by(id=kwargs['channel_id']).first().server
            elif 'server_id' in kwargs:
                server = Server.query.filter_by(id=kwargs['server_id']).first()
            result = True if server in g.user.servers or server in g.user.own_servers else False
        except:
            result = False

        return redirect(url_for('user.index')) if not result else view(*args, **kwargs)
    return censored_view

# Verify if user is owner of a target messge
def is_user_message_owner(view):
    @wraps(view)
    def censored_view(*args, **kwargs):
        try:
            if 'file_name' in kwargs:
                message = File.query.filter_by(name=kwargs['file_name']).first().message
            elif 'message_id' in kwargs:
                message = Message.query.filter_by(id=kwargs['message_id']).first()
            result = True if message.user_id == g.user.id else False
        except:
            result = False

        return redirect(url_for('user.index')) if not result else view(*args, **kwargs)
    return censored_view




# Things to be processed before any request -----------------------------

@user_bp.before_request
def before_request():
    check_user_lifetime()
    check_auth_lifetime()




# Views for unauthorized users  -----------------------------------------
#! entry と user blueprints にわけて実装中 -> header 有無を切替るのにURL情報を使用しようとする算段
#! user : 単一画面での情報編集等なのでheaderは常に表示 
#! entry : は "entry"をURL付属で判別可能
#! password 変更などのテンプレを使い回す際の棲み分けは？???
#! -> user は全体非同期でいくのでテンプレ引用のみでOK(headerへの仕掛けいらない)
#! ->> やっぱいるか...パスワ変更時にメール認証あるし
#! ->>> メール認証いらん、既存pswで...ログイン状態ならpswわかるし、忘れならログ前でリセット行為するはず

# ----------------------------------------------
#   ユーザーのサインアップ、ログイン、パスワードの更新   |
# ----------------------------------------------

# Initial page for unauthorized users
@entry_bp.route('/', methods=['GET', 'POST'])
@is_logged_in
def entry():
    pdf_key = 'linnbenton.pdf'
    url = s3_create_presigned_url(pdf_key)
    filename = 'icescream.png'
    body = s3_get_body(filename)
    img = translate_into_base64(body, filename)

    if request.method == 'POST':
        file = request.files['file']
        result = s3_upload_file(file)
        flash(result)

    return render_temp('project/user/main/entry.html', img=img, url=url)


#【Sign up】Sign up
@entry_bp.route('/signup', methods=['GET', 'POST'])
@is_logged_in
def signup():
    form = user_form(['name', 'email', 'psw_conf'], True)

    if form.validate_on_submit():
        subject = "【Log Base】Please confirm your email !"
        token = signup_token(form)
        url = url_for('user.entry.confirm_signup', token=token, _external=True)
        html = render_temp('project/user/email/confirm_user_account.html', url=url)
        send_email(form.email.data, subject, html)
        flash(f"We sent a user authentication email to [ {form.email.data} ]. Activate your account via the email.")
        return redirect(url_for('user.entry.entry'))

    return render_temp('project/user/main/auth.html', 'Sign Up', form)


#【Sign up】Confirm a request to create user account
@entry_bp.route('/signup_conf/<token>', methods=['GET'])
@is_logged_in
def confirm_signup(token):
    data = decode_token(token)

    user_to_add = User(
        name = data['name'],
        email = data['email'],
        password = data['psw'])
    db.session.add(user_to_add)
    db.session.commit()
    set_user_session(user_to_add)
    flash('Your account was successfully activated! Now you have access to all LogBase features.')
    return redirect(url_for('user.index'))


#【Log In】
@entry_bp.route('/login', methods=['GET', 'POST'])
@is_logged_in
def login():
    form = user_form(['email', 'psw'], lgin_type="user")

    if form.validate_on_submit():
        user_to_login = User.query.filter_by(email=form.email.data).first()

        if user_to_login and user_to_login.verify_password(form.psw.data):
            set_user_session(user_to_login)
            return redirect(url_for('user.index'))

    return render_temp('project/user/main/auth.html', 'Log In', form)


#【Password Reset】
@entry_bp.route('/forgot_password', methods=['GET', 'POST'])
@is_logged_in
def forgot_password():
    form = user_form(['email'])

    if form.validate_on_submit():
        email = form.email.data
        user = User.query.filter_by(email=email).first()

        if user == None or user.admin == True:
            flash(f'User with {email} doesn\'t exist.')
            return redirect(url_for('user.forgot_password'))

        subject = "【Log Base】Please confirm your email !"
        token = psw_reset_token(email)
        url = url_for('user.entry.confirm_password_reset', token=token, _external=True)
        html = render_temp('project/user/email/confirm_password_reset.html', url=url)
        send_email(email, subject, html)
        flash(f"We sent a confirmation email to [ {email} ]. Confirm the email to reset the password for your account.")
        return redirect(url_for('user.entry.entry'))

    return render_temp(
        'project/user/main/auth.html',
        'Forgot Password?', form)


#【Password Reset】Inspect a received token and go to the reset page 
@entry_bp.route('/confirm_password_reset/<token>', methods=['GET'])
@is_logged_in
def confirm_password_reset(token):
    data = decode_token(token)
    set_auth_session()
    return redirect(url_for(
        'user.entry.reset_password', email=data['email']))


#【Password Reset】Form page to reset password 
@entry_bp.route('/reset_password/<email>', methods=['GET', 'POST'])
@is_logged_in
def reset_password(email):
    if not is_auth_in_session():
        return redirect(url_for('user.entry.forgot_password'))

    form = user_form(['psw_conf'])
    if form.validate_on_submit():
        user = User.query.filter_by(email=email).first()
        if user:
            user.password = form.psw.data
            db.session.commit()
            flash(f'Password for {email} was successfully reset!')
        else:
            flash(f'User with {email} doesn\'t exist.')
        
        return redirect(url_for('user.entry.entry'))

    return render_temp(
        'project/user/main/auth.html',
        'Reset Passoword', form)




# Views for authorized users -------------------------------------------

# 削除されるmodelクラスに応じて、紐づくs3上のファイルも削除します
def delete_linked_s3(target):
    if target.className == "User":
        for os in target.own_servers:
            for c in os.channels:
                for m in c.messages:
                    result = [s3_delete_obj(f.name) for f in m.files]
    elif target.className == "Server":
        for c in target.channels:
            for m in c.messages:
                result = [s3_delete_obj(f.name) for f in m.files]
    elif target.className == "Channel":
        for m in target.messages:
            result = [s3_delete_obj(f.name) for f in m.files]
    elif target.className == "Message":
        result = [s3_delete_obj(f.name) for f in target.files]




# -------------------------------------------
#   サーバー一覧および、サーバーの作成、更新、削除   |
# -------------------------------------------

# Serverのサムネ画像をbase64に変更後、自身が所有するサーバー、
# ただ所属するのみのサーバーごとに格納したデータを返します
def get_server_img():
    own_server_img = []
    server_img = []
    if g.user.own_servers:
        for os in g.user.own_servers:
            if os.image_file_name:
                img = get_base64_from_s3(os.image_file_name)
            else:
                img = ""
            own_server_img.append(img)
    if g.user.servers:
        for s in g.user.servers:
            if s.image_file_name:
                img = get_base64_from_s3(s.image_file_name)
            else:
                img = ""
            server_img.append(img)
    return {"os":own_server_img, "s":server_img}


def get_server_update_forms(server_id=None, edited_form=None):
    server_forms = []
    if g.user.own_servers:
        for os in g.user.own_servers:
            os_dict = {}
            form = server_form(image_presence=os.image_file_name!=None)
            if server_id and os.id == server_id:
                os_dict["form"] = edited_form
            else:
                form.name.data = os.name
                os_dict["form"] = form
            server_forms.append(os_dict)
    return server_forms


# Server List
@user_bp.route('/', methods=['GET'])
@login_required
def index():
    form = server_form()
    update_form = server_form("update")
    return render_temp(
        'project/user/main/index.html', 'LOG BASE',
        form=form, server_img_dict=get_server_img(), update_form=update_form)


# Add server [Ajax]
@user_bp.route('/add_server', methods=['POST'])
@login_required
def add_server():
    form = server_form()
    form.name.data = request.form['name']

    if form.validate_on_submit():
        # Serverと付属の基本チャンネルを生成
        new_server = Server(
            name=form.name.data,
            owner_id=g.user.id,
            channels=[
                Channel(name="General")
            ]
        )
        db.session.add(new_server)
        db.session.commit()

        js_base64 = request.form['base64']
        filename = request.form['filename']
        # フォームに画像ファイルが存在し、拡張子が適正な場合、db用のファイル名を生成
        if js_base64 and allowed_file(filename, "image"):
            filename_for_db = translate_into_s3_format(
                standardize_filename(filename), "s", new_server.id)
        else:
            filename_for_db = None
        new_server.image_file_name = filename_for_db
        db.session.commit()
        # 画像ファイルをs3用に改名してs3バケットへアップロード
        if filename_for_db:
            s3_upload_file(decode_js_base64(js_base64), filename_for_db)

        data = {
            "result" : True,
            "new_srvr" : { "id" : new_server.id }
        }
        return data

    # ajaxでエラーメッセージを表示してもらう
    else:
        data = {
            "result" : False,
            "error_msg" : { "name" : form.name.errors[0] }
        }
        return jsonify(data)


# Update server [Ajax]
@user_bp.route('/server/<int:server_id>/update', methods=['POST'])
@login_required
@is_user_server_member
def update_server(server_id):
    server = Server.query.filter_by(id=server_id).first()
    update_form = server_form("update", server_id)
    update_form.name.data = request.form['name']

    if update_form.validate_on_submit():
        js_base64 = request.form['base64']
        filename = request.form['filename']
        deleting_image = request.form['delete_image']

        # フィールドにfileが存在し、拡張子が適正の場合、db用のfilenameを生成
        if filename and allowed_file(filename):
            filename_for_db = translate_into_s3_format(
                standardize_filename(filename), "s", server_id)
        else:
            filename_for_db = None
        # 単に画像を削除したい or 更新したい場合、既存画像の削除を実行
        if deleting_image or filename_for_db:
            s3_delete_obj(server.image_file_name)
        # 画像更新
        if filename_for_db:
                result = s3_upload_file(decode_js_base64(js_base64), filename_for_db)

        server.name = update_form.name.data
        server.image_file_name = filename_for_db
        db.session.commit()

        data = { "result" : True }
        return jsonify(data)

    else:
        data = {
            "result" : False,
            "error_msg" : { "name" : update_form.name.errors[0] }
        }
        return jsonify(data)


# Search Server [Ajax]
@user_bp.route('/search_server', methods=['POST'])
@login_required
def search_server():
    kw = request.form['keyword']
    servers = db.session.query(Server).filter(Server.name.contains(kw))
    data = {
        "kw" : kw,
        "server_info" : []
    }
    for s in servers:
        if s in g.user.servers or s in g.user.own_servers:
            continue
        data["server_info"].append({
            'name' : s.name,
            'num' : len(s.users)+1,
            'img' : get_base64_from_s3(s.image_file_name) if s.image_file_name else ""
        })
    return jsonify(data)


# Join server
@user_bp.route('/join_server/<string:server_name>', methods=['GET'])
@login_required
def join_server(server_name):
    server = Server.query.filter_by(name=server_name).first()
    if server:
        g.user.servers.append(server)
        db.session.commit()
        return redirect(url_for(
            'user.in_server', server_id=server.id, channel_id=server.channels[0].id))
    else:
        return redirect(url_for('user.index'))


# Delete Server [Ajax]
@user_bp.route('/server/<int:server_id>/delete', methods=['GET'])
@login_required
@is_user_server_member
def delete_server(server_id):
    try:
        server_to_delete = Server.query.filter_by(id=server_id).first()
        if server_to_delete.image_file_name:
            s3_delete_obj(server_to_delete.image_file_name)
        delete_linked_s3(server_to_delete)
        db.session.delete(server_to_delete)
        db.session.commit()
        return jsonify({ "result" : True })
    except:
        return jsonify({ "result" : False })


# Leave Server [Ajax]
@user_bp.route('/server/<int:server_id>/leave', methods=['GET'])
@login_required
@is_user_server_member
def leave_server(server_id):
    server = Server.query.filter_by(id=server_id).first()
    if g.user in server.users:
        index = server.users.index(g.user)
        server.users.pop(index)
        db.session.commit()
        return jsonify({ "result" : True })
    else:
        return jsonify({ "result" : False })




# -----------------------------------------------
#   チャンネル一覧および、チャンネルの作成、更新、削除   |
#   メッセージ一覧および、メッセージの作成、更新、削除   |
# -----------------------------------------------

# [Helper]
def store_files(files, msg_id):
    file_obj_list = []
    for fl in files:
        fl_obj = File(message_id=msg_id)
        db.session.add(fl_obj)
        file_obj_list.append(fl_obj)
    db.session.commit()

    for i, fl in enumerate(files):
        filename =  \
            translate_into_s3_format(
                standardize_filename(fl.filename), "f", file_obj_list[i].id)
        file_obj_list[i].name = filename
        fl.filename = filename
        s3_upload_file(fl)
    db.session.commit()

# [Helper] in_server用
def get_msg_files(messages):
    msg_files = {"img":[], "dcmnt":[]}
    for m in messages:
        imgs = [];
        dcmnts = [];
        for f in m.files:
            if allowed_file(f.name, "image"):
                imgs.append({
                    "s3name" : f.name,
                    "base64" : get_base64_from_s3(f.name)
                })
            else:
                dcmnts.append({
                    "name" : lift_s3_format(f.name),
                    "s3name" : f.name,
                    "url" : s3_create_presigned_url(f.name),
                    "size" : optimize_size_unit(s3_get_obj_size(f.name))
                })
        msg_files["img"].append(imgs)
        msg_files["dcmnt"].append(dcmnts)
    return msg_files

# [Helper] in_server用
def get_sender_images(channel):
    sender_images = {}
    for m in channel.messages:
        if m.sender.name not in sender_images:
            sender_images[m.sender.name] = \
                get_base64_from_s3(m.sender.image_file_name)
    return sender_images


# [Helper] Ajax用 (in_serverでは、ここではなくjinja2側で抽出した方が早いデータがあるため)
def get_msg_data_for_json(msg):
    if isinstance(msg, list):
        msg_data = { "messages" : [], "sender_b64" : {} }
        for i, m in enumerate(msg):
            msg_data["messages"].append({
                "id" : m.id,
                "date" : m.dateToDay,
                "pricise_date" : m.dateToMin,
                "sender_name" : m.sender.name,
                "content" : m.content.replace("\n", "<br>"),
                "files" : {
                    "img" : [],
                    "dcmnt" : []
                }
            })
            for f in m.files:
                if allowed_file(f.name, "image"):
                    msg_data["messages"][i]["files"]["img"].append({
                        "s3name" : f.name,
                        "base64" : get_base64_from_s3(f.name)
                    })
                else:
                    msg_data["messages"][i]["files"]["dcmnt"].append({
                        "s3name" : f.name,
                        "true_name" : lift_s3_format(f.name),
                        "url" : s3_create_presigned_url(f.name),
                        "size" : optimize_size_unit(s3_get_obj_size(f.name))
                    })
            # 差出人のアイコン画像を格納
            if m.sender.image_file_name and m.sender.name not in msg_data["sender_b64"]:
                msg_data["sender_b64"][m.sender.name] = \
                    get_base64_from_s3(m.sender.image_file_name)

    else:
        msg_data = {
            "id" : msg.id,
            "date" : msg.dateToDay,
            "pricise_date" : msg.dateToMin,
            "sender_name" : msg.sender.name,
            "sender_img" : get_base64_from_s3(msg.sender.image_file_name) \
                if msg.sender.image_file_name else "",
            "content" : msg.content.replace("\n", "<br>"),
            "files" : {
                "img" : [],
                "dcmnt" : []
            }
        }
        for f in msg.files:
            if allowed_file(f.name, "image"):
                msg_data['files']['img'].append({
                    "s3name" : f.name,
                    "base64" : get_base64_from_s3(f.name)
                    # json['file_list'][i]['base64'] # ajax側で生成したbase64を再利用
                })
            else:
                msg_data['files']['dcmnt'].append({
                    "s3name" : f.name,
                    "true_name" : lift_s3_format(f.name),
                    "url" : s3_create_presigned_url(f.name),
                    "size" : optimize_size_unit(s3_get_obj_size(f.name))
                })

    return msg_data


# In Server
@user_bp.route('/server/<int:server_id>', methods=['GET'])
@login_required
@is_user_server_member
def in_server(server_id):
    server = Server.query.filter_by(id=server_id).first()
    server_img = get_base64_from_s3(server.image_file_name) \
        if server.image_file_name else ""

    channel = server.channels[0] \
        if server.channels else None
    chnl_form = channel_form() if server.owner_id == g.user.id else ""

    msg_sender_imgs = get_sender_images(channel) \
        if channel else None
    msg_files = get_msg_files(channel.messages) \
        if channel else None
    msg_form = message_form()

    return render_temp(
        'project/user/main/in_server.html', server.name,
        server=server, server_img=server_img,
        channel=channel, chnl_form=chnl_form,
        msg_sender_imgs=msg_sender_imgs, msg_files=msg_files, msg_form=msg_form)


# Switch channel [Ajax]
@user_bp.route('/channel/<int:channel_id>/switch', methods=['GET'])
@login_required
@is_user_server_member
def switch_channel(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()
    if channel:
        msg_data = get_msg_data_for_json(channel.messages)
        data = {
            "result" : True,
            "chnl_name" : channel.name,
            "msg_data" : msg_data
        }
        return jsonify(data)

    else:
        return jsonify({ "result" : False })


# Add channel [Ajax]
@user_bp.route('/server/<int:server_id>/add_channel', methods=['POST'])
@login_required
@is_user_server_member
def add_channel(server_id):
    form = channel_form()
    form.name.data = request.form['name']
    if form.validate_on_submit():
        channel = Channel(name=form.name.data)
        server = Server.query.filter_by(id=server_id).first()
        server.channels.append(channel)
        db.session.commit()
        return jsonify({
            "result" : True ,
            "chnl_id" : channel.id
        })
    else:
        return jsonify({
            "result" : False,
            "error_msg" : { "name" : form.name.errors[0] }
        })


# Update channel [Ajax]
@user_bp.route('/channel/<int:channel_id>/update', methods=['POST'])
@login_required
@is_user_server_member
def update_channel(channel_id):
    form = channel_form()
    form.name.data = request.form['name']
    if form.validate_on_submit():
        channel = Channel.query.filter_by(id=channel_id).first()
        channel.name = form.name.data
        db.session.commit()
        return jsonify({ "result" : True })
    else:
        return jsonify({
            "result" : False,
            "error_msg" : { "name" : form.name.errors[0] }
        })


# Delete channel [Ajax]
@user_bp.route('/channel/<int:channel_id>/delete', methods=['GET'])
@login_required
@is_user_server_member
def delete_channel(channel_id):
    channel_to_delete = Channel.query.filter_by(id=channel_id).first()
    if channel_to_delete:
        delete_linked_s3(channel_to_delete)
        db.session.delete(channel_to_delete)
        db.session.commit()
        return jsonify({ "result" : True })
    else:
        return jsonify({ "result" : False })




# ---------------------------------------------
#   指定チャンネル内でのメッセージの投稿、更新、削除   |
# ---------------------------------------------

# Post message [Ajax]

@user_bp.route('/channel/<int:channel_id>/post_msg', methods=['POST'])
@login_required
@is_user_server_member
def post_message(channel_id):
    channel = Channel.query.filter_by(id=channel_id).first()
    if channel:
        json = request.json
        msg = Message(
            content = json['content'],
            channel_id = channel.id,
            user_id = g.user.id
        )
        db.session.add(msg)
        db.session.commit()

        # postされたファイルのdb用オブジェクトを生成 => s3にアップロード
        if json['file_list']:
            # postされたファイル数の数だけ空のfileデータを生成し、リストに格納 (後から肉付けしていく)
            file_obj_list = []
            for fl in json['file_list']:
                fl_obj = File(message_id=msg.id)
                db.session.add(fl_obj)
                file_obj_list.append(fl_obj)
            db.session.commit()

            for i, fl in enumerate(json['file_list']):
                filename_for_db =  \
                    translate_into_s3_format(
                        standardize_filename(fl["name"]), "f", file_obj_list[i].id)
                # 空fileデータに、s3用に生成したfilenameを肉付けしていく
                file_obj_list[i].name = filename_for_db
                # s3にアップロード
                s3_upload_file(
                    decode_js_base64(fl["base64"]), 
                    filename_for_db
                )
            db.session.commit()

        data = {
            "result" : True,
            "message" : get_msg_data_for_json(msg)
        }
        return jsonify(data)

    else:
        return jsonify({ "result" : False })


# update message (contentのみ) [Ajax]
@user_bp.route('/message/<int:message_id>/update', methods=['POST'])
@login_required
@is_user_message_owner
def update_message(message_id):
    msg = Message.query.filter_by(id=message_id).first()
    if msg:
        msg.content = request.form['content']
        db.session.commit()
        return jsonify({ "result" : True })
    else:
        return jsonify({ "result" : False })


# Delete message [Ajax]
@user_bp.route('/message/<int:message_id>/delete', methods=['GET'])
@login_required
def delete_message(message_id):
    msg = Message.query.filter_by(id=message_id).first()
    if msg:
        delete_linked_s3(msg)
        db.session.delete(msg)
        db.session.commit()
        return jsonify({ "result" : True })
    else:
        return jsonify({ "result" : False })


# Delete attached file [Ajax]
@user_bp.route('/file/<string:file_name>/delete', methods=['GET'])
@login_required
@is_user_message_owner
def delete_file(file_name):
    file = File.query.filter_by(name=file_name).first()
    msg = file.message

    s3_delete_obj(file.name)
    db.session.delete(file)
    db.session.commit()

    # テキストもファイルもからになった場合、メッセージを削除
    if (len(msg.files) == 0 and msg.content == ""):
        db.session.delete(msg)
        db.session.commit()

    return jsonify({ "result" : True })


# Auto update message list [Ajax]
@user_bp.route('/channel/<int:channel_id>/auto_update', methods=['POST'])
@login_required
@is_user_server_member
def auto_update(channel_id):
    new_msgs = Message.query.filter(
        Message.channel_id == channel_id,
        Message.id > int(request.form['latest_id']) 
    ).all()
    if new_msgs:
        data = {
            "result" : True,
            "msg_data" : get_msg_data_for_json(new_msgs)
        }
    else:
        data = { "result" : False }

    return jsonify(data)




# ------------------------
#   ビデオ通話での情報操作   |
# ------------------------

@user_bp.route('/reciever/<int:user_id>/info', methods=['GET'])
@login_required
@is_user_server_member
def get_reciever_info(user_id):
    reciever = User.query.filter_by(id=user_id).first()
    data = {
        "name" : reciever.name,
        "b64" : get_base64_from_s3(reciever.image_file_name)
    }
    return jsonify(data)




# ----------------------
#   アカウント情報の更新   |
# ----------------------

# Update profile image [Ajax]
@user_bp.route('/update_account_image', methods=['POST'])
@login_required
def update_account_image():
    js_b64 = request.form['b64']
    filename = request.form['filename']
    delete_image = request.form['image_delete']

    s3_delete_obj(g.user.image_file_name)
    if delete_image:
        g.user.image_file_name = None
        db.session.commit()

    # s3にアップロードかつdbでのファイル名称を変更
    else:
        filename_for_db = translate_into_s3_format( 
                standardize_filename(filename), "u", g.user.id)
        s3_upload_file(
            decode_js_base64(js_b64), 
            filename_for_db
        )
        g.user.image_file_name = filename_for_db
        db.session.commit()

    return jsonify({ "result" : True })


# Update name [Ajax]
@user_bp.route('/update_account_name', methods=['POST'])
@login_required
def update_account_name():
    form = user_form(['name', 'current_psw'], True, g.user.id)
    form.name.data = request.form['name']
    form.current_psw.data = request.form['psw']
    data = {
        "result" : False,
        "error_msg" : {
            "name" : "",
            "psw" : ""
        }
    }

    if form.validate_on_submit():
        if g.user.verify_password(request.form['psw']):
            g.user.name = form.name.data
            db.session.commit()
            data["result"] = True
        else:
            data["error_msg"]["psw"] = "Doesn't match your current password"
    else:
        if form.name.errors:
            data["error_msg"]["name"] = form.name.errors[0]
        if form.current_psw.errors:
            data["error_msg"]["psw"] = form.current_psw.errors[0]

    return jsonify(data)


# Update email [Ajax]
@user_bp.route('/update_account_email', methods=['POST'])
@login_required
def update_account_email():
    form = user_form(['email', 'current_psw'], True)
    form.email.data = request.form['email']
    form.current_psw.data = request.form['psw']
    data = {
        "result" : False,
        "error_msg" : {
            "email" : "",
            "psw" : ""
        }
    }

    if form.validate_on_submit():
        if g.user.verify_password(request.form['psw']):
            g.user.email = form.email.data
            db.session.commit()
            data["result"] = True
        else:
            data["error_msg"]["psw"] = "Doesn't match your current password"
    else:
        if form.email.errors:
            data["error_msg"]["email"] = form.email.errors[0]
        if form.current_psw.errors:
            data["error_msg"]["psw"] = form.current_psw.errors[0]

    return jsonify(data)


# Update password  [Ajax]
@user_bp.route('/update_account_password', methods=['POST'])
@login_required
def update_account_password():
    form = user_form(['psw_conf', 'current_psw'])
    form.psw.data = request.form['psw']
    form.conf.data = request.form['conf_psw']
    form.current_psw.data = request.form['prev_psw']
    data = {
        "result" : False,
        "error_msg" : {
            "psw" : "",
            "prev_psw" : ""
        }
    }

    if form.validate_on_submit():
        if g.user.verify_password(form.current_psw.data):
            g.user.password = form.psw.data
            db.session.commit()
            data["result"] = True
        else:
            data["error_msg"]["prev_psw"] = "Doesn't match your current password"
    else:
        if form.psw.errors:
            data["error_msg"]["psw"] = form.psw.errors[0]
        if form.current_psw.errors:
            data["error_msg"]["prev_psw"] = form.current_psw.errors[0]

    return jsonify(data)


#【Log out】
@user_bp.route('/logout', methods=['GET'])
@login_required
def logout():
    clear_user_session()
    return redirect(url_for('user.entry.entry'))


#【Leave】
@user_bp.route('/leave', methods=['GET'])
@login_required
def leave():
    if not g.user.sample:
        db.session.delete(g.user)
        db.session.commit()
        clear_user_session()
    return redirect(request.referrer)