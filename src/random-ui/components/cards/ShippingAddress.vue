<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>收货地址</CardTitle>
      <CardDescription>请填写收货地址</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field>
          <FieldLabel for="shipping-street">
            街道地址
          </FieldLabel>
          <Input id="shipping-street" placeholder="例如：北京市朝阳区某某街道123号" />
        </Field>
        <Field>
          <FieldLabel for="shipping-apt">
            门牌号 / 楼层
          </FieldLabel>
          <Input id="shipping-apt" placeholder="例如：4栋B单元" />
        </Field>
        <FieldGroup class="grid grid-cols-2">
          <Field>
            <FieldLabel for="shipping-city">
              城市
            </FieldLabel>
            <Input id="shipping-city" placeholder="北京" />
          </Field>
          <Field>
            <FieldLabel for="shipping-state">
              省份
            </FieldLabel>
            <Select default-value="CA">
              <SelectTrigger id="shipping-state" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="CA">
                    广东省
                  </SelectItem>
                  <SelectItem value="NY">
                    北京市
                  </SelectItem>
                  <SelectItem value="TX">
                    上海市
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <FieldGroup class="grid grid-cols-2">
          <Field>
            <FieldLabel for="shipping-zip">
              邮政编码
            </FieldLabel>
            <Input id="shipping-zip" placeholder="100000" />
          </Field>
          <Field>
            <FieldLabel for="shipping-country">
              国家/地区
            </FieldLabel>
            <Select default-value="US">
              <SelectTrigger id="shipping-country" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="US">
                    中国
                  </SelectItem>
                  <SelectItem value="CA">
                    中国香港
                  </SelectItem>
                  <SelectItem value="UK">
                    中国台湾
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="shipping-save" :default-checked="true" />
          <FieldLabel for="shipping-save" class="font-normal">
            设为默认地址
          </FieldLabel>
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm">
        取消
      </Button>
      <Button size="sm" class="ml-auto">
        保存地址
      </Button>
    </CardFooter>
  </Card>
</template>
