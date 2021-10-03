<template>
  <div
    :class="{
      com_waterfall_item: true,
      [props.size]: true,
      [props.class ?? '']: true
    }"
    ref="{ref}"
  >
    <div className="com_waterfall_item_avast">
      <img
        src="{avast}"
        onLoad="{imgLoadedHandle}"
        onError="{errorHandle}"
        onClick="{avastClickHandle}"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="com_waterfall_item_text_meta">
      <div className="com_waterfall_item_text_nickname">
        {data.nickname} {data.retired === GO_BOOL.yes ? (
        <div className="retiredTag" title="荣誉退休"> 休 </div>
        ) : null}
      </div>
      <div className="com_waterfall_item_text_job">{data.job}</div>
    </div>
    <div className="com_waterfall_item_bio">{data.bio}</div>
  </div>
</template>

<script lang="ts" setup>
import { Card, CardSize } from '@/types/collaborator'
import { defineProps } from 'vue'

const props = defineProps<{ class?: string; size: CardSize; data: Card }>()
</script>

<style lang="scss">
.flexBox {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.com_waterfall_item {
  width: 240px;
  border-radius: 8px;
  // padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  // border: 1px 1px #262626;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 1px 3px 0px rgba(#000, 0.2), 0px 1px 1px 0px rgba(#000, 0.14), 0px 2px 1px -1px rgba(#000, 0.12);
  overflow: hidden;
  .com_waterfall_item_avast {
    display: block;
    font-size: 0;
    img {
      // border-top-left-radius: 8px;
      // border-top-right-radius: 8px;
      width: 100%;
      height: 100%;
      min-height: 100px;
      object-fit: cover;
      object-position: top center;
    }
  }
  .com_waterfall_item_text_meta {
    color: #262626;
    // display: flex;
    // justify-content: space-between;
    padding: 16px;
    padding-bottom: 12px;
    .com_waterfall_item_text_nickname {
      font-size: 24px;
      line-height: 1.33;
      font-weight: bold;
    }
    .com_waterfall_item_text_job {
      color: rgba(#000, 0.54);
      font-size: 14px;
    }
    .com_waterfall_item_text_nickname,
    .com_waterfall_item_text_job {
      text-align: left;
      word-break: break-all;
    }
    .retiredTag {
      color: gray;
      border: 1px solid gray;
      border-radius: 2px;
      width: 1.3em;
      height: 1.3em;
      line-height: 1.3em;
      font-weight: normal;
      text-align: center;
      display: inline-block;
      transform: scale(0.4) translateY(10px);
      margin-left: 4px;
      transform-origin: left top;
    }
  }
  .com_waterfall_item_bio {
    font-size: 14px;
    // margin-top: 1em;
    line-height: 1.5;
    text-align: left;
    padding: 16px;
    padding-top: 0;
    white-space: pre-line;
    word-break: break-all;
  }

  &.retired {
    .com_waterfall_item_text_nickname,
    .com_waterfall_item_bio {
      color: rgba(#000, 0.54);
      word-break: break-all;
      white-space: pre-wrap;
    }
  }

  &.small {
    @extend .flexBox;
    justify-content: space-between;
    flex-wrap: wrap;

    .com_waterfall_item_text_meta {
      flex: 1;
    }

    .com_waterfall_item_avast {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
    }

    .com_waterfall_item_text_nickname {
      font-size: 16px;
    }
    .com_waterfall_item_text_job {
      margin-top: 0.4em;
    }
    .com_waterfall_item_bio {
      width: 100%;
      margin-top: 1em;
      padding: 8px;
    }
  }

  &.nano {
    background-color: transparent;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;

    .com_waterfall_item_avast {
      width: 100%;
      height: 100%;

      cursor: pointer;
    }

    .com_waterfall_item_text_meta,
    .com_waterfall_item_bio {
      display: none;
    }
  }
}
</style>
