import { useState } from 'react'
import { PlusCircle, Trash2, Download, Loader } from 'lucide-react'
import html2canvas from 'html2canvas'
import RedSeal from './components/RedSeal'
import './App.css'

function App() {
  // 状态管理
  const [dormNumber, setDormNumber] = useState('')
  const [signatories, setSignatories] = useState(['甲方', '乙方'])
  const [agreements, setAgreements] = useState(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [punishments, setPunishments] = useState<string[]>([])
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('')

  // 本地搞笑惩罚措施库（API失败时的兜底）
  const punishmentLibrary = [
    '违约方需在绝望坡来回折返跑三次，并大喊“我爱西政”',
    '违约方需前往罗马广场，当众深情朗读一段《民法典》婚姻家庭编',
    '违约方需帮全宿舍带饭一周，并运用微积分知识计算出送饭的最优路径',
    '违约方需运用侦查学技巧，查出隔壁宿舍谁半夜打呼噜最大声',
    '违约方需用商科思维，为宿舍制定一份“如果不挂科”的年度财务预算表',
    '违约方需对着毓秀湖的黑天鹅忏悔三分钟：“我有罪，我不该内卷”',
    '违约方需手抄《刑法》关于“滋事罪”的条款，并张贴在床头警示自己',
    '违约方被剥夺未来一周在宿舍讨论“法考”的权利',
    '违约方需模仿模拟法庭的审判长，敲着饭盆宣布“现在开庭”并给室友倒水',
    '违约方需在朋友圈发誓：“我再也不说“A大”了，我要去图书馆占座”'
  ]

  // 西政特色加载文案数组
  const loadingMessages = [
    '法官正在前往毓秀湖请示黑天鹅...',
    '正在计算该行为的边际社会成本（微积分运算中）...',
    '正在查阅《绝望坡攀登指南》寻找量刑依据...',
    '正在联系侦查学院提取现场指纹...',
    '法官正在罗马广场排队买奶茶，请稍候...',
    '正在翻阅2025年最新版《宿舍摸鱼法》...',
    '正在咨询宿管阿姨的最终意见...',
    '合议庭正在激烈争吵：是罚抄书还是罚带饭...',
    '正在评估该行为的法经济学影响...',
    '正在联系罗马广场的监控系统调阅证据...',
    '正在计算从宿舍到绝望坡的最佳跑步路线...',
    '法官正在喝毓秀湖的水恢复精力...',
    '正在查阅西政校规第108条关于摸鱼的规定...',
    '正在询问东园橘猫的目击证词...',
    '正在准备法槌和判决书...',
    '正在运用法理学分析该行为的本质...',
    '正在计算带饭的最优路径（图论算法中）...',
    '正在模拟法庭辩论场景...',
    '正在评估绝望坡跑步的物理消耗...',
    '正在联系图书馆查阅相关文献...'
  ]

  // 生成惩罚措施 - 使用DeepSeek API，失败时切换到本地库
  const generatePunishments = async (agreements: string[]): Promise<string[]> => {
    // 使用本地库生成惩罚的函数
    const generateFromLocalLibrary = (): string[] => {
      return agreements.map(() => {
        const randomIndex = Math.floor(Math.random() * punishmentLibrary.length)
        return punishmentLibrary[randomIndex]
      })
    }

    try {
      // 单个惩罚生成请求
      const generateSinglePunishment = async (violation: string): Promise<string> => {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-4540c8d4d75c445291e21eed20d88d11',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: '你是一名西南政法大学的铁面无私且幽默的法官，精通《民法典》、商科知识和侦查学反侦察技巧。你的任务是根据用户的“宿舍违约行为”，制定一条具有西政校园特色的、搞笑的、带有学科知识点的惩罚措施。'
              },
              {
                role: 'user',
                content: `违约行为：${violation}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        // 检查响应是否成功
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`)
        }

        const data = await response.json()
        // 验证返回数据结构
        if (!data || !Array.isArray(data.choices) || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
          throw new Error('API返回数据格式不正确')
        }
        // 去除Markdown星号
        return data.choices[0].message.content.trim().replace(/\*/g, '')
      }

      // 使用Promise.all并发请求所有惩罚
      const generatedPunishments = await Promise.all(
        agreements.map(agreement => generateSinglePunishment(agreement))
      )

      return generatedPunishments
    } catch (error) {
      // API调用失败，切换到本地库
      console.log('API调用失败，已切换至离线模式', error)
      return generateFromLocalLibrary()
    }
  }

  // 添加签署人
  const addSignatory = () => {
    const nextLetter = String.fromCharCode(65 + signatories.length)
    setSignatories([...signatories, `${nextLetter}方`])
  }

  // 删除签署人
  const removeSignatory = (index: number) => {
    if (signatories.length > 1) {
      setSignatories(signatories.filter((_, i) => i !== index))
    }
  }

  // 更新签署人名称
  const updateSignatory = (index: number, value: string) => {
    const newSignatories = [...signatories]
    newSignatories[index] = value
    setSignatories(newSignatories)
  }

  // 添加协议条款
  const addAgreement = () => {
    setAgreements([...agreements, ''])
  }

  // 删除协议条款
  const removeAgreement = (index: number) => {
    if (agreements.length > 1) {
      setAgreements(agreements.filter((_, i) => i !== index))
    }
  }

  // 更新协议条款
  const updateAgreement = (index: number, value: string) => {
    const newAgreements = [...agreements]
    newAgreements[index] = value
    setAgreements(newAgreements)
  }

  // 生成最终协议
  const generateAgreement = async () => {
    // 随机选择一条加载消息
    const randomIndex = Math.floor(Math.random() * loadingMessages.length)
    setCurrentLoadingMessage(loadingMessages[randomIndex])
    setIsLoading(true)
    try {
      // 生成惩罚措施
      const generatedPunishments = await generatePunishments(agreements)
      setPunishments(generatedPunishments)
    } catch (error) {
      console.error('生成惩罚措施失败:', error)
    } finally {
      setIsLoading(false)
      setCurrentLoadingMessage('')
    }
  }

  // 导出为证据图片
  const exportAsEvidence = async () => {
    const previewElement = document.getElementById('agreement-preview')
    if (!previewElement) return

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: '#fdfbf7',
        scale: 2, // 提高图片质量
        useCORS: true
      })

      // 将canvas转换为图片并下载
      const link = document.createElement('a')
      link.download = `宿舍协议-${dormNumber || '未命名'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('导出图片失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-8">
      {/* 顶部标题 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl text-red-600 font-bold">
          西南政法大学宿舍和平共处及违约责任认定书
        </h1>
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        {/* 左侧输入区域 */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6 border-b-2 border-gray-800 pb-2">
              协议信息录入
            </h2>

            {/* 宿舍号输入 */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">宿舍号</label>
              <input
                type="text"
                value={dormNumber}
                onChange={(e) => setDormNumber(e.target.value)}
                placeholder="例如：北园3栋502"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* 签署人输入 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold">签署人</label>
                <button
                  onClick={addSignatory}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <PlusCircle size={18} className="inline mr-1" />
                  添加签署人
                </button>
              </div>
              {signatories.map((signatory, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={signatory}
                    onChange={(e) => updateSignatory(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  {signatories.length > 1 && (
                    <button
                      onClick={() => removeSignatory(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 宿舍公约输入 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold">宿舍公约</label>
                <button
                  onClick={addAgreement}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <PlusCircle size={18} className="inline mr-1" />
                  添加条款
                </button>
              </div>
              {agreements.map((agreement, index) => {
                const placeholders = [
                  '打游戏禁止大喊A大A大',
                  '深夜12点后禁止煲电话粥'
                ];
                const placeholder = index < placeholders.length ? placeholders[index] : '请输入公约条款';
                return (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={agreement}
                      onChange={(e) => updateAgreement(index, e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    {agreements.length > 1 && (
                      <button
                        onClick={() => removeAgreement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6 border-b-2 border-gray-800 pb-2">
              协议预览
            </h2>
            {/* A4纸比例容器 */}
            <div
              id="agreement-preview"
              className="w-full aspect-[210/297] aged-paper border border-gray-300 p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl text-red-600 font-bold">
                  西南政法大学宿舍和平共处及违约责任认定书
                </h1>
                <p className="mt-2 text-gray-600">编号：{dormNumber ? `DORM-${dormNumber.replace(/[^0-9]/g, '')}` : 'DORM-XXXX'}</p>
                <p className="mt-4 text-sm text-gray-500 font-fangsong">
                  鉴于本宿舍全体成员均系西南政法大学合法公民，长期经受绝望坡之物理磨炼，饮毓秀湖之水思源，为避免在罗马广场发生肢体冲突，特依据《宿舍和平公约》制定本补充协议。
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">一、宿舍信息</h3>
                <p className="ml-4">宿舍号：{dormNumber || '__________'}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">二、签署各方</h3>
                <div className="ml-4">
                  {signatories.map((signatory, index) => (
                    <p key={index}>
                      {index + 1}. {signatory || '__________'}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">三、宿舍公约</h3>
                <div className="ml-4">
                  {agreements.map((agreement, index) => (
                    <div key={index} className="mb-2">
                      <p>
                        {index + 1}. {agreement || '______________________________'}
                      </p>
                      {punishments[index] && (
                        <p className="text-red-600 text-sm ml-6">
                          【违约责任】：{punishments[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4 relative">
                {signatories.map((signatory, index) => (
                  <div key={index} className="text-center">
                    <p className="mb-4">{signatory || '__________'} (签字)</p>
                    <div className="border-t border-gray-500 mt-4"></div>
                    <p className="text-sm mt-1">日期：______年______月______日</p>
                  </div>
                ))}
                
                {/* 电子红章 */}
                <RedSeal 
                  dormNumber={dormNumber || '未命名宿舍'}
                  className="absolute -bottom-4 right-10"
                />
              </div>
              
              {/* 见证人信息 */}
              <div className="text-center text-xs text-gray-500 mt-8">
                <p>法定见证人：毓秀湖黑天鹅 / 东园橘猫（自动签署）</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部按钮区域 */}
      <div className="text-center mt-10 flex justify-center gap-6">
        <button
          onClick={generateAgreement}
          disabled={isLoading}
          className={`px-8 py-3 text-lg font-bold rounded transition-colors flex items-center gap-2 justify-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin" size={20} />
              {currentLoadingMessage || '正在由法庭生成判决...'}
            </>
          ) : (
            '生成最终协议'
          )}
        </button>
        <button
          onClick={exportAsEvidence}
          className="bg-blue-600 text-white px-8 py-3 text-lg font-bold rounded hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          导出为证据
        </button>
      </div>
    </div>
  )
}

export default App
