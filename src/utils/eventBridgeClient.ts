import {
  SchedulerClient,
  CreateScheduleCommandInput,
} from "@aws-sdk/client-scheduler";

export const schedulerClient = new SchedulerClient({});

const region = process.env.REGION;
const accountId = process.env.ACCOUNT_ID;
const stage = process.env.STAGE

export interface INewSchedule {
  time: string;
  email: string;
  id: string;
}

export function createNewScheduleCommand({
  time,
  email,
  id,
}: INewSchedule): CreateScheduleCommandInput {


  const name = `expired_link_id-${id}`;
  const groupName = "deleteLink";
  const scheduleExpression = `at(${time})`;
  const targetArn = `arn:aws:lambda:${region}:${accountId}:function:shortlink-${stage}-deleteExpiredShortLinks`;
  const targetRoleArn = `arn:aws:iam::${accountId}:role/MainRole`;
  const targetInput = JSON.stringify({ id, email });

  return {
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    GroupName: groupName,
    Name: name,
    ScheduleExpression: scheduleExpression,
    Target: {
      Arn: targetArn,
      RoleArn: targetRoleArn,
      Input: targetInput,
    },
  };
}
