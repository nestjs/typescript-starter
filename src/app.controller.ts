import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  RmqContext,
  Ctx,
  Payload
} from '@nestjs/microservices';
import { AppService } from './app.service';

import { driver } from 'appium-android-driver'

@Controller()

export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('rabbit-mq-producer')
  public async execute(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const orginalMessage = context.getMessage();

    console.log('data', data);
    await this.appService.mySuperLongProcessOfUser(data)

    channel.ack(orginalMessage);

    ////////   AVD config   ////////////////////
    const wdio = require("webdriverio");

    const opts = {
        path: '/wd/hub',
        port: 4723,
        capabilities: {
            platformName: "Android",
            platformVersion: "11",
            deviceName: "delinternet_phone",
            automationName: "UiAutomator2",
            noReset: true,
            app: "/home/artem/Delinternet/android-test-with-appium/whatsapp.com.apk",
            appPackage: "com.whatsapp",
            appActivity: "com.whatsapp.Main",
        }
    };
    try {
        const client = await wdio.remote(opts);

        const searchBtn = await client.$('//android.widget.TextView[@content-desc="Search"]');
        await searchBtn.click();

        const inputField = await client.$('//android.widget.EditText[@resource-id="com.whatsapp:id/search_input"]');
        await inputField.setValue(data.number);

        const applyBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout[2]/android.widget.LinearLayout/androidx.recyclerview.widget.RecyclerView/android.widget.RelativeLayout/android.widget.LinearLayout');
        await applyBtn.click();

        const msgContent = await client.$('//android.widget.EditText[@index="1"]');
        await msgContent.setValue(data.message);

        const sendBtn = await client.$('//android.widget.ImageButton[@content-desc="Send"]');
        await sendBtn.click()
        await driver.pause(5000);

        await client.deleteSession();

        return true

    } catch (e) {
        return e
    }
  }
}