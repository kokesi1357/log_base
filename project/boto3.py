# boto3.py

import boto3
import os
from werkzeug.utils import secure_filename
from project.file import split_filename, get_file_format, allowed_file



BUCKET_NAME = 'logbase-bkt'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'gif'}



# ローカル環境でのs3アクセス
s3 = boto3.resource('s3',
        aws_access_key_id=os.environ.get('AWS_ACCESS'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS'),
        region_name='ap-northeast-1'
)
# EC2環境でのアクセス
# s3 = boto3.resource('s3')
s3_client = s3.meta.client



# ファイルの拡張子を可能なものは統一します(例：jpeg => jpg)
def standardize_file_format(filename):
    splited_filename = split_filename(filename)
    if splited_filename[1] =='jpeg':
        return splited_filename[0] +'.jpg'
    return filename


# s3バケットからオブジェクトのStreamingBodyを返します
# StreamingBody - objのdictにBodyプロパティとして収録、file objectのようなもの。
def s3_get_body(filename):
    try:
        file_format = get_file_format(filename)
        obj = s3.Bucket(BUCKET_NAME).Object(f"{file_format}/{filename}")
        return obj.get()['Body']
    except:
        return None


# s3バケットにオブジェクトをアップロードします
def s3_upload_file(file):
    try:
        filename = standardize_file_format(secure_filename(file.filename))
        if file and allowed_file(filename, ALLOWED_EXTENSIONS):
                file_format = get_file_format(filename)
                s3.Bucket(BUCKET_NAME).put_object(
                    Key=f"{file_format}/{filename}",
                    Body=file.read()
                )
                return True
        return False
    except:
        return False


# s3バケットから指定のオブジェクトをダウンロードできるリンクを生成します
def s3_create_presigned_url(filename, expiration=3600):
    """Generate a presigned URL to share an S3 object
    :param Bucket: string
    :param Key: string
    :param ExpiresIn: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    # Generate a presigned URL for the S3 object
    try:
        file_format = get_file_format(filename)
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': f"{file_format}/{filename}"},
            ExpiresIn=expiration
        )
    except:
        return None

    # The response contains the presigned URL
    return response


# s3バケット内のオブジェクトを削除します
def s3_delete_obj(object_name):
    s3.Object(BUCKET_NAME, object_name).delete()