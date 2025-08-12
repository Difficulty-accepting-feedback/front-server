import Link from "next/link"
import { Facebook, Instagram, Leaf, Twitter } from "lucide-react" // 소셜 아이콘

export default function Footer() {
    return (
        <footer className="bg-gradient-to-t from-green-50 to-white py-8 mt-auto dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    {/* 로고와 카피라이트 */}
                    <div className="flex items-center space-x-2">
                        <Leaf className="w-6 h-6 text-green-600 transition-transform duration-300 hover:rotate-12" />
                        <span className="text-gray-600 font-medium dark:text-gray-300">Grow © 2025. All rights reserved.</span>
                    </div>

                    {/* 링크 영역 */}
                    <nav className="flex space-x-6 text-gray-600 dark:text-gray-300">
                        <Link href="/terms" className="hover:text-green-600 transition-colors dark:hover:text-green-400">이용약관</Link>
                        <Link href="/privacy" className="hover:text-green-600 transition-colors dark:hover:text-green-400">개인정보 정책</Link>
                        <Link href="/contact" className="hover:text-green-600 transition-colors dark:hover:text-green-400">문의하기</Link>
                        <Link href="/faq" className="hover:text-green-600 transition-colors dark:hover:text-green-400">FAQ</Link>
                    </nav>

                    {/* 소셜 아이콘 */}
                    <div className="flex space-x-4">
                        <Link href="https://twitter.com/growapp" aria-label="Twitter" className="transition-transform hover:scale-110">
                            <Twitter className="w-5 h-5 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400" />
                        </Link>
                        <Link href="https://instagram.com/growapp" aria-label="Instagram" className="transition-transform hover:scale-110">
                            <Instagram className="w-5 h-5 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400" />
                        </Link>
                        <Link href="https://facebook.com/growapp" aria-label="Facebook" className="transition-transform hover:scale-110">
                            <Facebook className="w-5 h-5 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}