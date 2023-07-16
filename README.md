# prepare-resume-pdf-data

Step 1 of the `ResumePdfGenerator-Statemachine`

This gets all resume data from dynamodb and prunes/sorts it appropriately for a resume.

# generate-resume-pdf

Step 2 of the `ResumePdfGenerator-Statemachine`

This uses Handlebars and puppeteer to render and return a pdf of the JSON data it is given.

# upload-resume-pdf

Step 3 of the `ResumePdfGenerator-Statemachine`

This takes a PDF input and uploads the PDF to an S3 bucket, if any relevant changes were detected.

To update this function, I use vscode's `AWS:Upload Lambda` command, and upload the entire `upload-resume-pdf` as a directory.
