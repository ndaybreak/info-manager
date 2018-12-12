<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
      <span style="margin-left: 100px;color: #666666;">分类名：{{categoryName}}</span>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="访问量" width="80" prop="visitor_volume"></el-table-column>
      <el-table-column align="left" label="标题" width="200" prop="title"></el-table-column>
      <el-table-column align="left" label="摘要" width="200" prop="subhead"></el-table-column>
      <el-table-column align="center" label="作者" width="90" prop="author"></el-table-column>
      <el-table-column align="center" label="发布时间" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.incident_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建人" width="100" prop="creator_name"></el-table-column>
      <el-table-column align="center" label="创建时间" width="160" prop="create_time">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改时间" width="160" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否横幅" width="160" prop="create_time">
        <template slot-scope="scope">
          <span :style="{'color': scope.row.is_banner ? '#67c23a' : '' }">{{scope.row.is_banner | bool2Ch}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('table.actions')" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.is_recommend" size="mini" type="warning" @click="handleRecommend(scope.row, 'add')">推荐</el-button>
          <el-button v-if="scope.row.is_recommend" size="mini" type="warning" @click="handleRecommend(scope.row, 'cancel')" style="width: 67px;">取消推荐</el-button>
          <el-button type="success" size="mini" @click="handleBanner(scope.row)">横幅</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="横幅" :visible.sync="dialogFormVisible" class="slim-dialog">
      <el-form class="form-container" :model="bannerVal" :rules="rules" ref="bannerVal">
        <el-form-item label="开启横幅：" label-width="100px" style="width: 600px;position: relative">
          <el-switch
            v-model="bannerVal.isBanner"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>

        <el-form-item label="图片：" label-width="100px" style="width: 600px;position: relative">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            name="file"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="bannerVal.bannerUrl" :src="bannerVal.bannerUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span style="color: red;">(图片尺寸为400*264pix)</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="bannerOperation">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { helpListFetchAll, helpListDelete, bannerOperation, recommendOperation } from '@/api/help'
  import waves from '@/directive/waves' // 水波纹指令

  const defaultBannerVal = {
    isBanner: true,
    bannerUrl: ''
  }
  export default {
    name: 'helpList',
    components: {
    },
    directives: {
      waves
    },
    data() {
      return {
        bannerVal: { ...defaultBannerVal },
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        tempInfo: {
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加',
          copy: '复制'
        },
        rules: {
          title: [{ required: true, message: '请填写', trigger: 'blur' }],
          language: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        updatingObj: '',
        coinFeeTemplateList: [],
        coinList: [],
        isEdit: false,
        categoryName: '',
        uploadAction: ''
      }
    },
    created() {
      this.uploadAction = this.baseUrl + '/file/uploadImg'
      this.query.id = this.$route.query.categoryId
      this.categoryName = this.$route.query.categoryName
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        helpListFetchAll(this.query).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
          if (this.list.length === 0 && this.query.currPage !== 1) {
            this.getList()
          }
        })
      },
      handleSizeChange(val) {
        this.query.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.query.currPage = val
        this.getList()
      },
      handleDelete(row) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          helpListDelete(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      handleCreate() {
        this.$router.push({
          path: 'module-detail',
          query: {
            categoryId: this.$route.query.categoryId,
            categoryName: this.$route.query.categoryName
          }
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleUpdate(row) {
        this.$router.push({
          path: 'module-detail',
          query: {
            titleId: row.id,
            categoryId: this.$route.query.categoryId,
            categoryName: this.$route.query.categoryName
          }
        })
      },
      handleRecommend(row, type) {
        if (type === 'add') {
          this.$confirm('确认推荐?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            recommendOperation({ id: row.id, isRecommend: true }).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功!'
              })
              this.getList()
            })
          })
        } else {
          this.$confirm('确认取消?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            recommendOperation({ id: row.id, isRecommend: false }).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功!'
              })
              this.getList()
            })
          })
        }
      },
      handleBanner(row) {
        this.bannerVal = {
          ...row,
          isBanner: row.is_banner,
          bannerUrl: row.banner_url
        }
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['bannerVal'].clearValidate()
        })
      },
      handleAvatarSuccess(res) {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '上传成功!'
          })
          this.bannerVal.bannerUrl = res.data.fileUrl
        } else {
          this.$message.error(res.info)
        }
      },
      beforeAvatarUpload(file) {
        // const isJPG = file.type === 'image/jpeg'
        const isLt5M = file.size / 1024 / 1024 < 5
        const isImg = file.type.indexOf('image') > -1

        if (!isImg) {
          this.$message.error('请上传图片!')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过 5MB!')
          false
        }
        return true
      },
      bannerOperation() {
        if (this.bannerVal.isBanner && !this.bannerVal.bannerUrl) {
          this.$message.error('请上传图片!')
          return
        }
        bannerOperation(this.bannerVal).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.dialogFormVisible = false
          this.getList()
        })
      }
    }
  }
</script>
<style scoped>
  .item-right {
    margin-left: 60px;
  }
  .avatar {
    width: 400px;
    height: 264px;
  }
</style>
