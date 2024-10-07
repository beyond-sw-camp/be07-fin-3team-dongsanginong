<template>     
    <v-container>
      <!-- 🔖 LIVE LIST 화면 -->
      <template v-if="!session">   
        <!-- 즐겨찾기 농장 중 진행중인 라이브 : seller에게는 나타나지 않음 -->
        <v-card 
          style="border-radius: 15px; padding: 20px; max-width: 1200px; width: 100%; border-bottom: 1px solid #D4D4D4;" 
          rounded="0" 
          flat 
          v-if="!isSeller">
          <v-card-title>✨ Favorites</v-card-title>
          <v-card-text style="color: gray;">스크랩 된 농장의 라이브 목록입니다.</v-card-text>
          <div style="display: flex; justify-content: center; align-items:center;">
            <v-btn icon="mdi-chevron-left" variant="plain" @click="prev"></v-btn>
            <v-window v-model="onboarding" style="width: 1080px;">
              <v-window-item v-for="n in windowCount" :key="`window-${n}`" :value="n">
                <v-row class="d-flex justify-center">
                  <v-col 
                    v-for="live in paginatedLives(n)" 
                    :key="live.id" 
                    cols="12" 
                    md="3" 
                    class="d-flex justify-center">
                    <v-card variant="text" style="width:235px; height:360px;" @click="joinExistingSession(live.id)">
                      <div class="viewer-count">{{ live.participantCount }}명 시청 중</div> //☀️
                      <v-img
                        class="live-image"
                        width="235"
                        height="300px"
                        :src="live.liveImage"
                        alt="Live 썸네일"
                        cover
                      />
                      <v-card-text style="text-align: center;">
                        <span v-if="live.title.length > 10">
                          [ {{ live.farmName }} ] {{ live.title.substring(0, 10) }}...
                        </span>
                        <span v-else>[ {{ live.farmName }} ] {{ live.title }}</span>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
            <v-btn icon="mdi-chevron-right" variant="plain" @click="next"></v-btn>
          </div>
          <v-card-actions style="justify-content: center;">
            <v-item-group v-model="onboarding" class="text-center" mandatory>
              <v-item 
                v-for="n in windowCount" 
                :key="`btn-${n}`" 
                v-slot="{ isSelected, toggle }" 
                :value="n">
                <v-btn :color="isSelected ? 'yellow' : 'deep_green'" icon="mdi-circle-small" @click="toggle"></v-btn>
              </v-item>
            </v-item-group>
          </v-card-actions>
        </v-card>
    
        <!-- 진행 중인 라이브 목록 (전체) -->
        <v-container style="width: 100%; text-align: center;">
          <h3>라이브 목록</h3>
          <v-btn v-if="isSeller" class="start-btn" @click="openModal">라이브 시작</v-btn>
          <v-container class="d-flex custom-card-container">
            <v-row style="justify-content: center;">
              <v-card 
                v-for="live in liveList" 
                :key="live.liveId" 
                class="live-card" 
                md="2" 
                variant="text" 
                style="width:200px; height:360; margin: 10px; margin-bottom: 15px;" 
                @click="joinExistingSession(live.liveId)">
                <div v-if="live.participantCount !== null && live.participantCount !== undefined" class="viewer-count">
                  {{ live.participantCount }}명 시청 중
                </div>
                <!-- //☀️ -->
                <v-img
                  class="live-image"
                  width="180px"
                  height="280px"
                  :src="live.liveImage"
                  alt="live 썸네일" 
                  cover
                />
                <v-card-text>
                  <span v-if="live.title.length > 10">
                    [ {{ live.farmName }} ] {{ live.title.substring(0, 10) }}... 
                  </span>
                  <span v-else>[ {{ live.farmName }} ] {{ live.title }}</span>
                </v-card-text>
              </v-card>
            </v-row>
          </v-container>
        </v-container>
    
        <!-- 라이브 시작 모달창 : seller가 title과 썸네일 사진을 추가함 -->
        <v-dialog v-model="startLiveDialog" max-width="600px">
          <v-card class="live-modal">
            <v-card-text style="display: flex; align-items: center; justify-content: center">
              <img src="/live.png" width=40 alt="Logo" style="padding-bottom:2px;" />
              <strong>라이브 시작하기</strong>
            </v-card-text>
            <v-text-field
              v-model="title"
              placeholder="라이브 제목을 작성하세요."
              hide-details
              solo-inverted
              flat
              class="live-input"
              prepend-inner-icon="mdi-emoticon-happy-outline"
            ></v-text-field>
            <v-file-input
              label="썸네일 이미지를 추가하세요."
              accept="image/*"
              @change="onThumbnailImageUpload"
            />
            <v-row class="modal-action">
              <v-btn class="modal-btn" @click="startLive" style="background-color: #BCC07B;">시작</v-btn>
              <v-btn class="modal-btn" @click="cancelLive" style="background-color: #e0e0e0;">취소</v-btn>
            </v-row>
          </v-card>
        </v-dialog>
      </template>
    </v-container>
</template>
  
<script>
import axios from 'axios';
export default {
    data() {
        return {
            isSeller: false,
            favoritesLiveList: [], 
            onboarding: 1,
            windowCount: 3,
            liveList: [],
            startLiveDialog: false,

            isPublisher: false, // 방송자 여부 
            title: "",
            liveImage: "",
            file: null,

            isLoading: false,
            isLastPage: false,
            currentPage: 0,
            pageSize: 7,
        };
    },
    async created() {
        // 즐겨찾기 뿌리기
        const role = localStorage.getItem('role');
        if (role === 'SELLER') {
            this.isSeller = true;
        } else {
            this.isSeller = false;     
            try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/favorites/farm/live/list`, {
                headers: {
                myId: localStorage.getItem('memberId')
                }
            });
            this.favoritesLiveList = response.data;
            this.windowCount = Math.ceil(this.favoritesLiveList.length / 4);
            } catch (e) {
            console.log(e.message);
            }
        }
        // 전체 라이브 목록 뿌리기
        let params = {
            page: this.currentPage,
            size: this.pageSize,
        };
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/live-service/live/active`, {params});
            console.log("전체 : ", response.data.content);
            this.liveList = response.data.content;
        } catch(e) {
            console.log(e);
        }
        window.addEventListener('scroll', this.scrollPagination);
    },
    methods: {
        // 썸넬 이미지 등록 
        async handleImageUpload(blob) {
            const accessToken = localStorage.getItem('accessToken');
            const body = {
                prefix: "Live",
                url: `${blob?.name}`,
            };
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            };
            const getUrl = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });
            const urlContentType = getUrl.headers.get("content-type");
            let getUrlResult;
            if (urlContentType && urlContentType.includes("application/json")) {
                getUrlResult = await getUrl.json(); // JSON으로 파싱
            } else {
                getUrlResult = await getUrl.text(); // 텍스트로 파싱
            }
            const awsUrl = {
                data: `${getUrlResult.split("?")[0]}`,
                auth: `?${getUrlResult.split("?")[1]}`,
            };
            const options = {
                method: "PUT", // PUT 메서드 사용
                headers: {
                    "Content-Type": blob.type, // Blob의 MIME 타입 설정
                },
                body: blob, // 업로드할 파일 데이터
            };
            await fetch(awsUrl.data + awsUrl.auth, options);
            return awsUrl.data;
        },
        async onThumbnailImageUpload(event) {
            const file = event?.target?.files[0];
            this.liveImage = await this.handleImageUpload(file);
        },
        // 즐찾 리스트 슬라이더
        paginatedLives(page) {
            const livePerPage = 4;
            const start = (page - 1) * livePerPage;
            const end = start + livePerPage;
            return this.favoritesLiveList.slice(start, end);
        },
        next() {
            this.onboarding = this.onboarding + 1 > this.windowCount ? 1 : this.onboarding + 1;
        },
        prev() {
            this.onboarding = this.onboarding - 1 <= 0 ? this.windowCount : this.onboarding - 1;
        },
        // 스크롤
        async loadLive() {
            try {
                if(this.isLoading || this.isLastPage) return;
                this.isLoading = true;
                this.currentPage++;
                let params = {
                    page: this.currentPage,
                    size: this.pageSize,
                };
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/live-service/live/active`, { params });
                const additionalData = response.data.content;
                this.liveList = [...this.liveList, ...additionalData];
                this.isLastPage = response.data.last; // 라스트 여부
                this.isLoading = false; // 로딩 끝!
            } catch(e) {
                console.log(e);
            }
            console.log(this.currentPage);
        },
        scrollPagination() {
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
            if(isBottom && !this.isLastPage && !this.isLoading) {
                this.loadLive();
            }
        },
        // 라이브 시작하기 위해 title, 썸네일 추가하는 모달창
        openModal() {
            this.startLiveDialog = true;
        },
        cancelLive() {
            this.startLiveDialog = false;
            this.title = "";
            this.liveImage = "";
        },
        // 방송자: 라이브 시작
        async startLive() {
            if (this.title && this.liveImage) {
                const liveData = {
                    title: this.title,
                    liveImage: this.liveImage
                };
                try {
                    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/live-service/api/sessions`, liveData, {
                        headers: {
                            'sellerId': localStorage.getItem('sellerId'),
                        },
                    });
                    console.log("라우팅 하기 직전 : ", response);

                    this.isPublisher = true;

                    // 세션 시작 후 LiveStream.vue로 이동
                    this.$router.push({
                        path: `/live/${response.data.sessionId}`,
                        query: { title: this.title, isPublisher: true }
                    });
                } catch (error) {
                    console.error('라이브 시작 오류:', error);
                }
            }
        },
        // 시청자: 기존 세션에 접속
        async joinExistingSession(liveId) {
            console.log("시청자 세션 : ", liveId);
            this.isPublisher = false; // 시청자 설정
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/live-service/api/sessions/${liveId}/sessionId`);
                console.log(response.data.sessionId);
                this.mySessionId = response.data.sessionId;
                console.log("join 세션id : ", this.mySessionId);

                // 세션 접속 후 LiveStream.vue로 이동
                this.$router.push({
                    path: `/live/${response.data.sessionId}`,
                    query: { title: response.data.title, isPublisher: false }
                });
            } catch (error) {
                console.error('세션 ID 가져오기 오류:', error);
            }
        },
    }
  }
</script>
<style scoped>
.start-btn {
    background-color: #BCC07B; 
    border-radius: 50px;
    float: right;
    margin-right: 30px;
    font-weight: 700;
}
.live-modal {
    height: 350px;
    padding: 15px;
}
.modal-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    margin-right: 10px;
}
.modal-btn {
    border-radius: 50px;
    margin-left: 10px; 
}
.viewer-count {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7); /* 배경을 반투명하게 설정 */
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 1; /* 이미지를 덮도록 설정 */
} /* ☀️ */
</style>