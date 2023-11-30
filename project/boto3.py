# boto3.py

import boto3
import os
from project.env import is_production
from project.file import split_filename, get_file_format, allowed_file, \
    standardize_filename



BUCKET_NAME = 'logbase-bkt'




# EC2環境でのアクセス
if is_production():
    s3 = boto3.resource('s3')
# ローカル環境でのs3アクセス
else:
    s3 = boto3.resource('s3',
            aws_access_key_id=os.environ.get('AWS_ACCESS'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS'),
            region_name='ap-northeast-1'
    )

s3_client = s3.meta.client


# s3バケットからオブジェクトのサイズを返します
def s3_get_obj_size(filename):
    try:
        file_format = get_file_format(filename)
        if is_production():
            return s3.ObjectSummary(BUCKET_NAME, f'production/{file_format}/{filename}').size
        else:
            return s3.ObjectSummary(BUCKET_NAME, f'local/{file_format}/{filename}').size
    except:
        return None


# s3バケットからオブジェクトのStreamingBodyを返します
# StreamingBody - objのdictにBodyプロパティとして収録、file objectのようなもの。
def s3_get_body(filename):
    try:
        file_format = get_file_format(filename)
        if is_production():
            obj = s3.Bucket(BUCKET_NAME).Object(f'production/{file_format}/{filename}')
        else:
            obj = s3.Bucket(BUCKET_NAME).Object(f'local/{file_format}/{filename}')
        return obj.get()['Body']
    except:
        return None


# s3バケットにオブジェクトをアップロードします
def s3_upload_file(file_binary, filename):
    try:
        file_format = get_file_format(filename)
        key = f'production/{file_format}/{filename}' if is_production() else f'local/{file_format}/{filename}'
        s3.Bucket(BUCKET_NAME).put_object(
            Key=key,
            Body=file_binary
        )
        return True
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
        key = f'production/{file_format}/{filename}' if is_production() else f'local/{file_format}/{filename}'
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': key
            },
            ExpiresIn=expiration
        )
        # The response contains the presigned URL
        return response
    except:
        return None


# s3バケット内のオブジェクトを削除します
def s3_delete_obj(filename):
    try:
        file_format = get_file_format(filename)
        key = f'production/{file_format}/{filename}' if is_production() else f'local/{file_format}/{filename}'
        s3.Object(BUCKET_NAME, key).delete()
        return True
    except:
        return False


# 削除されるmodelクラスに応じて、紐づくs3上のファイルも削除します
def delete_linked_s3(target):
    try:
        if target.className == 'User':
            if target.image:
                s3_delete_obj(target.image.name)
            # 自身のサーバに紐づくファイルを削除(サーバのサムネ、メッセージの添付ファイル)
            for os in target.own_servers:
                if os.image:
                    s3_delete_obj(os.image.name)
                for c in os.channels:
                    for m in c.messages:
                        result = [s3_delete_obj(f.name) for f in m.files]
            # 自身がこれまで送信したメッセージの添付ファイルを削除
            for m in target.messages:
                result = [s3_delete_obj(f.name) for f in m.files]

        elif target.className == 'Server':
            if target.image:
                s3_delete_obj(target.image.name)
            for c in target.channels:
                for m in c.messages:
                    result = [s3_delete_obj(f.name) for f in m.files]

        elif target.className == 'Channel':
            for m in target.messages:
                result = [s3_delete_obj(f.name) for f in m.files]

        elif target.className == 'Message':
            result = [s3_delete_obj(f.name) for f in target.files]

        return False if False in result else True

    except:
        return False