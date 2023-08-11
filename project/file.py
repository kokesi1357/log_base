# file.py

# ファイル名をベース名 + 拡張子に分け配列で返します
def split_filename(filename):
    return filename.rsplit('.', 1)


# ファイルの拡張子を取得します
def get_file_format(filename):
    file_format = split_filename(filename)[1].lower()
    return file_format


# ファイルがプロジェクト内で取扱可能なフォーマットかをジャッジします
def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
        get_file_format(filename) in allowed_extensions