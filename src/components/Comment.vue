<template>
  <q-card>
    <!-- todo 针对小屏幕可能得换个写法 -->
    <q-list v-if="user">
      <q-item>
        <q-item-section avatar v-if="!$q.screen.xs">
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
          <q-btn :loading="posting" class="fit" @click="post">发表评论</q-btn>
        </q-item-section>
      </q-item>

      <q-separator v-intersection="onVisible" spaced />

      <template v-if="!isActive">
        <div class="row flex-center">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>

      <template v-else-if="comment?.Data?.length === 0">
        <div class="row flex-center" style="height: 40px; padding-bottom: 8px">
          <div>暂无评论</div>
        </div>
      </template>

      <template v-else-if="comment">
        <template v-for="item in comment.Data" :key="item.Id">
          <q-item>
            <q-item-section top avatar>
              <q-avatar size="48px">
                <img :src="comment.Users[`${comment.Commentaries[`${item.Id}`].UserId}`].Avatar" alt="avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">
                {{ comment.Users[`${comment.Commentaries[`${item.Id}`].UserId}`].UserName }}
              </q-item-label>
              <q-item-label class="pre">
                {{ comment.Commentaries[`${item.Id}`].Content }}
              </q-item-label>
              <q-item-label caption>
                <div class="row flex-align-center q-gutter-x-md">
                  <div>{{ toNow(comment.Commentaries[`${item.Id}`].CreatedTime) }}</div>
                  <div>
                    <q-btn flat dense @click="showReply(item.Id)">回复</q-btn>
                    <q-btn flat dense v-if="comment.Commentaries[`${item.Id}`].CanEdit" @click="_delete(item.Id)">
                      删除
                    </q-btn>
                  </div>
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
                        <q-item-label v-if="comment.Commentaries[`${replyId}`].ReplyId">
                          <span class="text-bold">
                            {{ comment.Users[`${comment.Commentaries[`${replyId}`].UserId}`].UserName }}
                          </span>
                          回复
                          <span class="text-bold">
                            {{
                              comment.Users[
                                `${comment.Commentaries[`${comment.Commentaries[`${replyId}`].ReplyId}`].UserId}`
                              ].UserName
                            }}
                          </span>
                        </q-item-label>
                        <q-item-label v-else>
                          <b>{{ comment.Users[`${comment.Commentaries[`${replyId}`].UserId}`].UserName }}</b>
                        </q-item-label>
                        <q-item-label class="pre">
                          {{ comment.Commentaries[`${replyId}`].Content }}
                        </q-item-label>
                        <q-item-label caption>
                          <div class="row flex-align-center q-gutter-x-md">
                            <div>{{ toNow(comment.Commentaries[`${replyId}`].CreatedTime) }}</div>
                            <div>
                              <q-btn flat dense @click="showReply(item.Id, replyId)">回复</q-btn>
                              <q-btn
                                flat
                                dense
                                v-if="comment.Commentaries[`${replyId}`].CanEdit"
                                @click="_delete(replyId)"
                              >
                                删除
                              </q-btn>
                            </div>
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

          <q-separator spaced inset="item" />
        </template>
      </template>

      <q-item v-if="comment?.TotalPages">
        <q-item-section class="row flex-center pagination">
          <q-pagination
            style="margin-bottom: 12px"
            padding="4px"
            :disable="!isActive"
            v-model="currentPage"
            :max="comment?.TotalPages"
            direction-links
            :icon-first="icon.mdiSkipPrevious"
            :icon-last="icon.mdiSkipNext"
            :icon-prev="icon.mdiChevronLeft"
            :icon-next="icon.mdiChevronRight"
            :max-pages="8"
            :input="!$q.screen.gt.sm"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="replyShow">
      <q-card style="width: 90vw; max-width: 400px">
        <q-card-section>
          <div class="text-h6">
            回复
            <span class="text-bold">
              {{ comment.Users[`${comment.Commentaries[`${replyId || parentId}`].UserId}`].UserName }}
            </span>
            的评论
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            placeholder="请输入评论"
            outlined
            type="textarea"
            clearable
            autogrow
            :input-style="{ minHeight: '100px', maxHeight: '60vh' }"
            v-model="inputReplyComment"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="回复" color="primary" @click="reply" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script lang="ts" setup>
import { postComment, replyComment, getComment, deleteComment } from 'src/services/comment'
import { CommentType, GetComment } from 'src/services/comment/types'
import { toNow } from 'src/utils/time'
import { useAppStore } from 'stores/app'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useQuasar } from 'quasar'
import { icon } from 'assets/icon'
import { getErrMsg } from 'src/utils/getErrMsg'

const props = defineProps<{ type: CommentType; id: number }>()
const $q = useQuasar()
const appStore = useAppStore()
const { user } = storeToRefs(appStore)
const comment = ref<GetComment.Response>()

const isActive = computed(
  () => comment.value?.Type === props.type && comment.value?.Id === props.id && currentPage.value === comment.value.Page
)

const currentPage = ref(1)
const inputComment = ref()
const posting = ref(false)
const needRequest = ref(false)
const replyShow = ref(false)
const inputReplyComment = ref()
const parentId = ref<number>()
const replyId = ref<number>()

const request = async () => {
  comment.value = await getComment({ Type: props.type, Id: props.id, Page: currentPage.value })
  posting.value = false
}

function onVisible(entry: IntersectionObserverEntry) {
  if (entry.isIntersecting) {
    if (needRequest.value) {
      needRequest.value = false
      request()
    }
  }
}

watch(() => currentPage.value, request)

const post = async () => {
  if (inputComment.value) {
    posting.value = true
    try {
      await postComment({ Type: props.type, Id: props.id, Content: inputComment.value })
      $q.notify({
        message: '评论成功',
        timeout: 2000,
        type: 'positive'
      })
    } catch (error) {
      $q.notify({
        message: getErrMsg(error),
        color: 'negative',
        timeout: 1500
      })
    }
    posting.value = false
    inputComment.value = null
    await request()
  }
}

const showReply = async (_parentId: number, _replyId?: number) => {
  parentId.value = _parentId
  replyId.value = _replyId
  replyShow.value = true
}

const reply = async () => {
  if (inputReplyComment.value) {
    try {
      await replyComment({
        Type: props.type,
        Id: props.id,
        Content: inputReplyComment.value,
        ReplyId: replyId.value || null,
        ParentId: parentId.value
      })
      $q.notify({
        message: '评论成功',
        timeout: 2000,
        type: 'positive'
      })
    } catch (error) {
      $q.notify({
        message: getErrMsg(error),
        color: 'negative',
        timeout: 1500
      })
    }
    inputReplyComment.value = null
    await request()
  }
}

const _delete = async (id) => {
  $q.dialog({
    title: '提示',
    message: '你确定要删除这条评论吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await deleteComment(id)
    $q.notify({
      message: '删除成功',
      timeout: 2000,
      type: 'positive'
    })
    await request()
  })
}

useInitRequest(
  () => {
    needRequest.value = true
  },
  { isActive }
)
</script>

<style scoped lang="scss">
.pre {
  white-space: pre-wrap;
}
.reply {
  :deep(.q-item__section--avatar) {
    min-width: unset;
  }
}
.pagination {
  :deep(.q-btn) {
    min-width: 34px !important;
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
