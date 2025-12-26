import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* 導航欄 */}
      {/* 導航欄 */}
      <Header />

      {/* 主要內容 */}
      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
                找球友，訂場地
                <br />
                <span className="text-primary-600">一站搞定</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                台灣最大的網球社群平台，提供智能球友配對、場地預訂、教練服務等功能。
                讓你輕鬆找到合適的球友，享受網球樂趣。
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/partners">
                  <button className="btn-primary btn-lg">
                    立即開始
                  </button>
                </Link>
                <Link href="/about">
                  <button className="btn-outline btn-lg">
                    了解更多
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 功能特色 */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900">
                為什麼選擇我們？
              </h3>
              <p className="mt-4 text-lg text-gray-600">
                專為網球愛好者設計的全方位服務平台
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* 球友配對 */}
              <Link href="/partners" className="card-hover text-center block group">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <span className="text-2xl">🤝</span>
                </div>
                <h4 className="mt-4 text-xl font-semibold text-gray-900">
                  智能球友配對
                </h4>
                <p className="mt-2 text-gray-600">
                  基於技術等級、地理位置和時間偏好，為你推薦最合適的球友
                </p>
              </Link>

              {/* 場地預訂 */}
              <Link href="/courts" className="card-hover text-center block group">
                <div className="mx-auto h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <span className="text-2xl">🏟️</span>
                </div>
                <h4 className="mt-4 text-xl font-semibold text-gray-900">
                  場地預訂
                </h4>
                <p className="mt-2 text-gray-600">
                  搜尋附近的網球場地，查看評價和價格，一鍵完成預訂
                </p>
              </Link>

              {/* 教練服務 */}
              <Link href="/coaches" className="card-hover text-center block group">
                <div className="mx-auto h-12 w-12 rounded-lg bg-success-100 flex items-center justify-center group-hover:bg-success-200 transition-colors">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h4 className="mt-4 text-xl font-semibold text-gray-900">
                  專業教練
                </h4>
                <p className="mt-2 text-gray-600">
                  認證教練提供個人或團體課程，智能排課系統幫你找到最佳時間
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white">
                準備開始你的網球之旅了嗎？
              </h3>
              <p className="mt-4 text-lg text-primary-100">
                加入我們的社群，與數千名網球愛好者一起享受運動樂趣
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <button className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg">
                    免費註冊
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-900 text-white">
        <div className="container">
          <div className="py-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h5 className="text-lg font-semibold">網球平台</h5>
                <p className="mt-2 text-gray-400">
                  台灣最大的網球社群平台
                </p>
              </div>
              <div>
                <h6 className="font-semibold">功能</h6>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li><Link href="/partners" className="hover:text-white">球友配對</Link></li>
                  <li><Link href="/courts" className="hover:text-white">場地預訂</Link></li>
                  <li><Link href="/coaches" className="hover:text-white">教練服務</Link></li>
                  <li><Link href="/rackets" className="hover:text-white">球拍推薦</Link></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold">支援</h6>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li>幫助中心</li>
                  <li>聯絡我們</li>
                  <li>意見回饋</li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold">法律</h6>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li>隱私政策</li>
                  <li>服務條款</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 py-6">
            <p className="text-center text-gray-400">
              © 2024 網球平台. 保留所有權利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}