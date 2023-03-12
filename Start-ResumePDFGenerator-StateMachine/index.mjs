import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

export const handler = async (event, context) => {
  const client = new SFNClient({ region: 'us-east-2' });
  const params = {
    stateMachineArn: "arn:aws:states:us-east-2:810191593673:stateMachine:ResumePDFGenerator",
    input: JSON.stringify({}),
    name: `LambdaExecution-${(new Date()).getTime()}`
  };
  const command = new StartExecutionCommand(params);
  return await client.send(command);
};
