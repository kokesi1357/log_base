# file.py

import math
from werkzeug.utils import secure_filename
from googletrans import Translator


ALLOWED_FILE_EXTENSIONS =['txt', 'pdf', 'jpg', 'jpeg', 'png','gif']
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
TRANSLATOR = Translator()


# ファイル名をベース名[0] + 拡張子[1]に分け配列で返します
def split_filename(filename):
    try:
        return filename.rsplit('.', 1)
    except:
        return None


# ファイルの拡張子を取得します
def get_file_format(filename):
    try:
        file_format = split_filename(filename)[1].lower()
        return file_format
    except:
        return None


# ファイルがプロジェクト内で取扱可能なフォーマットかをジャッジします
#? jsでvalidationしてるからいらないかも
def allowed_file(filename, extension_range=None):
    allowed_extensions = ALLOWED_IMAGE_EXTENSIONS \
        if extension_range == 'image' else ALLOWED_FILE_EXTENSIONS

    return '.' in filename and \
        get_file_format(filename) in allowed_extensions


# ファイルの識別名を統一します
# - 全体を小文字
# - jpeg => jpg
def standardize_filename(filename):
    try:
        filename = secure_filename(TRANSLATOR.translate(filename, dest="en").text)
        splited_filename = split_filename(filename)
        return filename if splited_filename[1] != 'jpeg' \
            else splited_filename[0] + '.' + 'jpg'
    except:
        return None


# ファイル名をs3上で利用し易い名式にします
# 元ファイルベース名_モデルイニシャル_dataId.ファイル拡張子
# モデルイニシャル : User => u, Server => s, Message => m
# 例 : u_1_sample.jpg
def translate_into_s3_format(filename, mdl, data_id):
    try:
        splited_filename = split_filename(filename)
        filename = \
            mdl + '_' + str(data_id) + '_' + splited_filename[0] + '.' + splited_filename[1]
        return filename
    except:
        return None


# dbおよびs3へ保存用の名式を元のファイル名に変換します
def lift_s3_format(filename):
    try:
        return filename.split('_', 2)[2]
    except:
        return None


# file sizeを適切な単位に変換します
def optimize_size_unit(size):
    try:
        units = ('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', "ZB")
        i = math.floor(math.log(size, 1024)) if size > 0 else 0
        size = round(size / 1024 ** i, 2)
        return f'{size} {units[i]}'
    except:
        return None