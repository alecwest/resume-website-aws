import { S3Client, PutObjectCommand, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: 'us-east-2'
});

export const handler = async (event, context) => {
  const targetBucket = "resume-website-pdf-bucket";
  const targetUser = "Alec West".replace(/\s/g, "_");
  const targetKey = `${targetUser}/${targetUser}_Resume_${(new Date()).getFullYear()}.pdf`;
  const getObjectCommand = new GetObjectCommand({
    Bucket: targetBucket,
    Key: targetKey
  });

  console.log("EVENT:", JSON.stringify(event));
  console.log("CONTEXT:", JSON.stringify(context));

  try {
    console.log("checking for object");
    const getObjectResponse = await client.send(getObjectCommand);
    
    const str = await getObjectResponse.Body.transformToString('base64');
    console.log("existing object size == ", str.length);
    console.log("incoming object size == ", event.body.length);
    
    if (str === event.body) {
      console.log("No PDF change, will not update.");
    } else {
      console.log("pdf's are not the same, updating...");
      await putPdf(targetBucket, targetKey, event.body);
    }
  } catch (err) {
    if (err instanceof NoSuchKey) {
      console.log(`${targetKey} does not yet exist, adding now.`);
      await putPdf(targetBucket, targetKey, event.body);
    } else {
      console.error(err);
    }
  }
};

async function putPdf(targetBucket, targetKey, pdfString) {
  const putCommand = new PutObjectCommand({
    Bucket: targetBucket,
    Key: targetKey,
    Body: new Buffer.from(pdfString, 'base64')
  });
  return client.send(putCommand);
}
