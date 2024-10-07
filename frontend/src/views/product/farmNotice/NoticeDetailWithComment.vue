<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6" lg="8">
                <v-card class="notice-class elevation-0" outlined>
                    <v-card-title style="font-size: 17px;"> {{ title }} </v-card-title>
                    <v-card-text>{{ content }}</v-card-text>

                    <v-carousel
                        v-if="images && images.length > 0"
                        hide-delimiters
                        height="300"
                        class="mt-3"
                    >
                        <v-carousel-item
                            v-for="image in images"
                            :key="image.id">
                        <v-img :src="image" alt="Notice image" height="300"></v-img>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>
                <br>
                <h3 style="padding-left: 15px;">댓글 {{ commentCnt }}개</h3>
                <br>
                <!-- 댓글 작성 -->
                <v-row>
                    <v-text-field
                        v-model="comment"
                        placeholder="댓글 추가"
                        hide-details
                        solo-inverted
                        flat
                        class="comment-input"
                        prepend-inner-icon="mdi-emoticon-happy-outline"
                    ></v-text-field>
                    <v-btn class="submit-btn" @click="submitComment">작성</v-btn>
                </v-row>
                <br><br>
                <!-- 댓글 조회 -->
                <v-card v-for="comment in commentList" :key="comment.id" class="comment-class elevation-0" outlined>
                    <v-row>
                        <v-card-text>&nbsp;&nbsp;&nbsp;<strong>@{{ comment.name }}</strong>&nbsp;&nbsp;
                            <span style="font-size: 12px;">({{ comment.formattedDate }})</span></v-card-text>
                        <v-btn v-if="comment.memberId == userId" color="white" style="box-shadow: none; border: none; margin-bottom: 10px; font-size: 12px;" @click="openOptions(comment)">
                            <img src="/plus.png" width=13 alt="Logo" /> 
                        </v-btn>
                    </v-row>
                    <v-card-text>{{ comment.contents }}</v-card-text>
                    <hr class="hr-style">
                    <br>

                    <!-- 수정 / 삭제 선택 모달 -->                    
                    <v-dialog v-model="dialog" max-width="250px">
                        <v-card class="modal" style="overflow-y: hidden; height:110px; padding-bottom: 20px;">
                            <v-card-text style="text-align: center;">선택해주세요.</v-card-text>
                            <v-row justify="center" align="center" class="text-center" style="height: 100%; padding-right: 10px;;">
                                <v-btn text @click="openEditModal(selectedComment)" class="modal-btn submit-btn">댓글 수정</v-btn>
                                <v-btn text @click="deleteComment(selectedComment.id)" class="modal-btn submit-btn" style="background-color: #e0e0e0;">댓글 삭제</v-btn>
                            </v-row>
                        </v-card>
                    </v-dialog>
                </v-card>
                <!-- 페이징 처리 -->
                <v-pagination
                    v-model="currentPage"
                    :length="pageCount"
                ></v-pagination>
                
            </v-col>
        </v-row>
        <!-- 댓글 내용 수정 모달 -->
        <v-dialog v-model="editDialog" max-width="400px">
            <v-card class="modal" style="padding: 10px;">
                <v-card-text style="text-align: center; padding-bottom: 5px;">댓글 수정</v-card-text>
                <v-card-text>
                    <v-text-field
                        v-model="editedComment"
                        placeholder="댓글 내용을 수정하세요."
                        hide-details
                        solo-inverted
                        flat
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="savedEditComment" class="modal-btn submit-btn">수정</v-btn>
                    <v-btn @click="editDialog = false" class="modal-btn submit-btn" style="background-color: #e0e0e0;">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 수정 / 삭제 완료 모달 -->
        <v-dialog v-model="alertModal" max-width="260px">
            <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
                <v-card-text>완료되었습니다.</v-card-text>
                <v-btn @click="alertModal= false;" class="submit-btn">close</v-btn>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            title: "",
            content: "",
            images: [],
            commentCnt: 0,
            commentList: [],
            comment: "",

            currentPage: 1, // 페이지 1번부터 시작 
            pageSize: 15, // 한 페이지에 15개씩 출력 
            totalItems: 0,   

            userId: localStorage.getItem('memberId'), 
            dialog: false,  
            selectedComment: null,

            alertModal: false,
            editDialog: false,
        }
    },
    computed: {
        pageCount() {
            return Math.ceil(this.totalItems / this.pageSize);
        }
    },
    watch: {
        currentPage(newPage) {
            this.farmNoticeDetail(newPage);
        }
    },
    created() {
        this.farmNoticeDetail(this.currentPage);
    },
    methods: {
        async submitComment() { // 댓글 작성 
            if (!this.comment) {
                console.log('작성된 내용 없음');
                return;
            }
            try {
                const farm_id = this.$route.params.farmId;
                const notice_id = this.$route.params.notice_id;
                const memberId = localStorage.getItem('memberId');
                const commentData = {
                    contents: this.comment
                };
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/${farm_id}/notice/${notice_id}/comment/create`, commentData, {
                    headers: {
                        myId: memberId
                    }
                });

                this.comment = '';
                this.farmNoticeDetail(this.currentPage);

                console.log('댓글 작성 완료');
            } catch (e) {
                console.error('에러 :', e);
            }
        },
        async farmNoticeDetail(page) { // 공지사항 및 댓글 조회 
            try {
                const farm_id = this.$route.params.farmId;
                const notice_id = this.$route.params.notice_id;
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${farm_id}/notice/${notice_id}`);
                console.log(response.data);

                this.title = response.data.title;
                this.content = response.data.content;
                this.commentCnt = response.data.commentCnt;
                this.images = response.data.noticeImages;

                const response2 = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${farm_id}/notice/${notice_id}/comment`, {
                    params: {
                        page: page - 1, 
                        size: this.pageSize  
                    }
                });
                this.commentList = response2.data.content;
                this.totalItems = response2.data.totalElements;
                
                this.commentList = response2.data.content.map(comment => {
                    const [date, time] = comment.createdAt.split('T');
                    return {
                        ...comment,
                        formattedDate: `${date} ${time.split('.')[0]}`
                    };
                });
                console.log(this.commentList);
            } catch(e) {
                console.log(e);
            }
        },
        openOptions(comment) { // 댓글 수정 및 삭제 선택 모달 
            this.selectedComment = comment;
            this.dialog = true; 
        },
        openEditModal(comment) { // 댓글 수정 모달 
            this.selectedComment = comment;
            this.editedComment = comment.contents; 
            this.dialog = false; 
            this.editDialog = true; 
        },
        async savedEditComment() { // 댓글 수정 진행 모달 
            try {
                const commentId = this.selectedComment.id;
                const commentData = {
                    contents: this.editedComment
                };
                console.log("commentId : ", commentId);
                await axios.put(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/comment/${commentId}`, commentData);
                console.log("put 지남");

                this.editedComment = '';
                this.farmNoticeDetail(this.currentPage);
                this.editDialog = false;
                this.alertModal = true;
                console.log('댓글 수정 완료');
            } catch(e) {
                console.log(e.message);
            }
        },
        async deleteComment(commentId) { // 댓글 삭제 
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/comment/${commentId}/delete`, {
                    headers: {
                        myId: this.userId
                    }
                });
                this.farmNoticeDetail(this.currentPage);
                this.dialog = false;
                this.alertModal = true;

            } catch(e) {
                console.log(e.message);
            }
        },
    }

};
</script>

<style scoped>
.notice-class {
    margin-top: 20px;
    width: 800px;
    border: 1px solid #d4d4d4;
    border-radius: 10px;

    padding-top: 10px;
    padding-bottom: 10px;
    padding-right: 30px;
    padding-left: 30px;
}
.comment-class {
    padding-left: 12px;
}
.comment-input {
    padding-left: 25px;
}
.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}
.hr-style {
  border: none;
  border-top: 0.9px solid lightgray; 
  margin-top: 10px;
}
.modal-btn {
    border: none;
    box-shadow: none;
}
.modal {
    background-color: rgb(255, 255, 255);
    border: none;
    box-shadow: none;
    border-radius: 10px;
}
</style>
