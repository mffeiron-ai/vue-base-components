<script setup lang="ts">
import ComputeConfig from '../components/forms/ComputeConfig.vue' // 计算资源配置
import CreateAccountForm from '../components/forms/CreateAccountForm.vue' // 创建账户表单
import InputGroups from '../components/forms/InputGroups.vue' // 输入框组合
import SettingsSheet from '../components/forms/SettingsSheet.vue' // 侧边设置面板
import ActivateAgentDialog from '../components/forms/ActivateAgentDialog.vue' // 激活智能体对话框
import AssignIssue from '../components/forms/AssignIssue.vue' // 分配问题表单
import BookAppointment from '../components/forms/BookAppointment.vue' // 预约表单
import EnvironmentVariables from '../components/forms/EnvironmentVariables.vue' // 环境变量表单
import FeedbackForm from '../components/forms/FeedbackForm.vue' // 反馈表单
import FileUpload from '../components/forms/FileUpload.vue' // 文件上传表单
import InviteTeam from '../components/forms/InviteTeam.vue' // 邀请团队表单
import Preferences from '../components/forms/Preferences.vue' // 首选项表单
import QrConnect from '../components/forms/QrConnect.vue' // 扫码连接表单
import ReportBug from '../components/forms/ReportBug.vue' // 问题报告表单

import ReceivingMethod from '../components/cards/ReceivingMethod.vue' // 收款方式卡片
import ShippingAddress from '../components/cards/ShippingAddress.vue'// 收货地址卡片
import AccountAccess from '../components/cards/AccountAccess.vue' // 账户访问
import TransferFunds from '../components/cards/TransferFunds.vue' // 转账
import PayoutThreshold from '../components/cards/PayoutThreshold.vue' // 付款阈值卡片

</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">表单与输入组件</p>
        <p class="text-sm text-muted-foreground">覆盖账户、转账、预约、上传、问题提报等操作。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <AccountAccess />
          <TransferFunds />
          <ReceivingMethod />
          <ShippingAddress />
          <BookAppointment />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <FeedbackForm />
          <ReportBug />
          <AssignIssue />
          <FileUpload />
          <PayoutThreshold />
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">配置与对话组件</p>
        <p class="text-sm text-muted-foreground">适合偏后台型的设置、邀请、环境变量与扫码流程。</p>
      </div>
      <div class="flex flex-col gap-(--gap)">
        <Preferences />
        <EnvironmentVariables />
        <InviteTeam />
        <ActivateAgentDialog />
        <QrConnect />
      </div>
    </section>

    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">基础表单组件</p>
        <p class="text-sm text-muted-foreground">账户注册、字段配置、输入框组合与侧边设置面板。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <CreateAccountForm />
          <InputGroups />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <ComputeConfig />
          <SettingsSheet />
        </div>
      </div>
    </section>
  </div>
</template>
