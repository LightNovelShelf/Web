<template>
  <q-card>
    <!-- todo 针对小屏幕可能得换个写法 -->
    <q-list v-if="user">
      <q-item>
        <q-item-section avatar>
          <q-avatar size="48px">
            <img :src="user.Avatar" alt="avatar" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-input
            placeholder="请输入评论"
            outlined
            type="textarea"
            clearable
            :input-style="{ height: '100px' }"
            v-model="inputComment"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn class="fit">发表评论</q-btn>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <template v-if="comment">
        <template v-for="(item, index) in comment.Data" :key="item.Id">
          <q-item>
            <q-item-section top avatar>
              <q-avatar size="48px">
                <img :src="comment.Users[`${comment.Commentaries[`${item.Id}`].UserId}`].Avatar" alt="avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <b>{{ comment.Users[`${comment.Commentaries[`${item.Id}`].UserId}`].UserName }}</b>
              </q-item-label>
              <q-item-label>
                {{ comment.Commentaries[`${item.Id}`].Content }}
              </q-item-label>
              <q-item-label caption>
                <div class="row flex-align-center q-gutter-x-md">
                  <div>{{ toNow(comment.Commentaries[`${item.Id}`].CreatedTime, baseTime) }}</div>
                  <q-btn flat dense>回复</q-btn>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>

          <template v-if="item.Reply">
            <q-separator spaced inset="item" />
            <q-item style="padding: 0">
              <q-item-section avatar> </q-item-section>

              <q-item-section>
                <q-list class="reply">
                  <template v-for="(replyId, replyIndex) in item.Reply" :key="replyId">
                    <q-item>
                      <q-item-section top avatar>
                        <q-avatar size="24px">
                          <img
                            :src="comment.Users[`${comment.Commentaries[`${replyId}`].UserId}`].Avatar"
                            alt="avatar"
                          />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-if="comment.Commentaries[`${replyId}`].ReplyId === 0">
                          <b>{{ comment.Users[`${comment.Commentaries[`${replyId}`].UserId}`].UserName }}</b>
                        </q-item-label>
                        <q-item-label v-else>
                          <b>{{ comment.Users[`${comment.Commentaries[`${replyId}`].UserId}`].UserName }}</b>
                          回复
                          <b>
                            {{
                              comment.Users[
                                `${comment.Commentaries[`${comment.Commentaries[`${replyId}`].ReplyId}`].UserId}`
                              ].UserName
                            }}
                          </b>
                        </q-item-label>
                        <q-item-label>
                          {{ comment.Commentaries[`${replyId}`].Content }}
                        </q-item-label>
                        <q-item-label caption>
                          <div class="row flex-align-center q-gutter-x-md">
                            <div>{{ toNow(comment.Commentaries[`${replyId}`].CreatedTime, baseTime) }}</div>
                            <q-btn flat dense>回复</q-btn>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator v-if="replyIndex + 1 !== item.Reply.length" style="margin-left: 48px" spaced />
                  </template>
                </q-list>
              </q-item-section>
            </q-item>
          </template>

          <q-separator v-if="index + 1 !== comment.Data.length" spaced inset="item" />
          <q-separator v-else spaced />
        </template>
      </template>
    </q-list>
  </q-card>
</template>

<script lang="ts" setup>
import { postComment, replyComment, getComment } from '@/services/comment'
import { CommentType, GetComment } from '@/services/comment/types'
import { baseTime } from '@/composition/useToNow'
import { toNow } from '@/utils/time'
import { useAppStore } from '@/store'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

const appStore = useAppStore()
const { user } = storeToRefs(appStore)
const inputComment = ref()
const comment = ref<GetComment.Response>()

const request = useTimeoutFn(async () => {
  comment.value = await getComment({ Type: CommentType.Announcement, Id: 1, Page: 1 })
})

useInitRequest(request)
</script>

<style scoped lang="scss">
.reply {
  :deep(.q-item__section--avatar) {
    min-width: unset;
  }
}
:deep(.q-item) {
  padding: 8px 16px 0 16px;
}
:deep(.q-field__native) {
  padding-top: 4px;
}
:deep(.q-field__append) {
  align-self: center;
}
</style>
