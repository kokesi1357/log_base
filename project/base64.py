# base64.py

import base64
from project.file import get_file_format, allowed_file



ALLOWED_EXTENSIONS = {'png', 'jpg', 'gif'}



# ファイルオブジェクトの中身をbase64フォーマットに変換します
# 当関数の対象ファイルフォーマットは png, jpg, gif のみ
def translate_into_base64(file, filename):
    try:
        if file and allowed_file(filename, ALLOWED_EXTENSIONS):
            b64 = base64.b64encode(file.read()).decode('utf-8')
            file_format = get_file_format(filename)
            source = f"data:image/{file_format};base64," + b64;
            return source
        return None
    except:
        return None