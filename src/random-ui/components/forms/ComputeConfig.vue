<script setup lang="ts">
import { ref } from "vue"
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

const gpuCount = ref(8)
const priceRange = ref([200, 800])
const computeEnvironment = ref("kubernetes")

function adjustGpu(adjustment: number) {
  const newValue = gpuCount.value + adjustment
  if (newValue >= 1 && newValue <= 99) {
    gpuCount.value = newValue
  }
}
</script>

<template>
  <FieldSet class="w-full max-w-md">
    <FieldGroup>
      <FieldSet>
        <FieldLegend>计算环境</FieldLegend>
        <FieldDescription>
          选择群集的计算环境。
        </FieldDescription>
        <RadioGroup v-model="computeEnvironment">
          <FieldLabel for="kubernetes-r2h">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Kubernetes</FieldTitle>
                <FieldDescription>
                  在 K8s 配置的集群上运行 GPU 工作负载，这是默认选项。
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem
                id="kubernetes-r2h"
                value="kubernetes"
                aria-label="Kubernetes"
              />
            </Field>
          </FieldLabel>
          <FieldLabel for="vm-z4k">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>虚拟机</FieldTitle>
                <FieldDescription>
                  访问配置了 VM 的集群以运行工作负载。（即将推出）
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem
                id="vm-z4k"
                value="vm"
                aria-label="虚拟机"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel for="number-of-gpus-f6l">
            GPU 数量
          </FieldLabel>
          <FieldDescription>可以稍后添加更多。</FieldDescription>
        </FieldContent>
        <ButtonGroup>
          <Input
            id="number-of-gpus-f6l"
            :model-value="gpuCount"
            :size="3"
            :maxlength="3"
            @update:model-value="gpuCount = Number($event)"
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Decrement"
            :disabled="gpuCount <= 1"
            @click="adjustGpu(-1)"
          >
            <IconPlaceholder
              lucide="MinusIcon"
              tabler="IconMinus"
              hugeicons="MinusSignIcon"
              phosphor="MinusIcon"
              remixicon="RiSubtractLine"
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Increment"
            :disabled="gpuCount >= 99"
            @click="adjustGpu(1)"
          >
            <IconPlaceholder
              lucide="PlusIcon"
              tabler="IconPlus"
              hugeicons="PlusSignIcon"
              phosphor="PlusIcon"
              remixicon="RiAddLine"
            />
          </Button>
        </ButtonGroup>
      </Field>
      <FieldSeparator />
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel for="tinting">
            壁纸着色
          </FieldLabel>
          <FieldDescription>
            允许壁纸被着色。
          </FieldDescription>
        </FieldContent>
        <Switch id="tinting" default-checked />
      </Field>
      <FieldSeparator />
      <Field>
          <FieldTitle>价格区间</FieldTitle>
          <FieldDescription>
            设置您的预算范围（$<span class="font-medium tabular-nums">{{ priceRange[0] }}</span> -
            <span class="font-medium tabular-nums">{{ priceRange[1] }}</span>）。
        </FieldDescription>
        <Slider
          v-model="priceRange"
          :max="1000"
          :min="0"
          :step="10"
          class="mt-2 w-full"
          aria-label="Price Range"
        />
      </Field>
      <Field orientation="horizontal">
        <Button type="submit">
          提交
        </Button>
        <Button variant="outline" type="button">
          取消
        </Button>
      </Field>
    </FieldGroup>
  </FieldSet>
</template>
