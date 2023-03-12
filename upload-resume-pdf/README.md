This Lambda function will take the output of "generate-resume-pdf" (a base64 encoded PDF contained within output.Payload.body) and upload it to an S3 bucket.

If the PDF seems suspiciously small (perhaps something went wrong with the PDF generation), the function will fail

PDF names will key off the user (hardcoded to myself for now) and the current year.
