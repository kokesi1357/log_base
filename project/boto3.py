# boto3.py

import boto3
import os
from project.file import split_filename, get_file_format, allowed_file, \
    standardize_filename



BUCKET_NAME = 'logbase-bkt'



# ローカル環境でのs3アクセス
s3 = boto3.resource('s3',
        aws_access_key_id=os.environ.get('AWS_ACCESS'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS'),
        region_name='ap-northeast-1'
)
# EC2環境でのアクセス
# s3 = boto3.resource('s3')
s3_client = s3.meta.client


# s3バケットからオブジェクトのサイズを返します
def s3_get_obj_size(filename):
    try:
        file_format = get_file_format(filename)
        return s3.ObjectSummary(BUCKET_NAME, f"{file_format}/{filename}").size
    except:
        return None


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
def s3_upload_file(file_binary, filename):
    try:
        file_format = get_file_format(filename)
        s3.Bucket(BUCKET_NAME).put_object(
            Key=f"{file_format}/{filename}",
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
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': f"{file_format}/{filename}"},
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
        s3.Object(BUCKET_NAME, f"{file_format}/{filename}").delete()
        return True
    except:
        return False