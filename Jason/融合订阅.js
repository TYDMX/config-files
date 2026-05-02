//https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Jason/融合订阅.js
function main(config) {
    const 图标库 = "https://github.com/Koolson/Qure/raw/master/IconSet/Color/";

    // ═══════════════════════════════════
    //   一、数据准备层
    // ═══════════════════════════════════
    // --- ① 合并外部订阅 ----------
    config["proxy-providers"] = {
        ...(config["proxy-providers"] || {}),
        //"自建 🌏": { url: "https://sub.dmit.dpdns.org/share/sub/dingyue_Center_zijian_auto?token=xgy1nCsG7xgerdecv4QRn",  interval: 3600 },
        //"自建 🔮": { url: "https://raw.githubusercontent.com/go4sharing/sub/main/clash.yaml",  interval: 3600 },
        //"节点池 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?nstream=netflix,disney&type=vless",  interval: 3600 },
        //"节点池vmess 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?nstream=netflix,disney&type=vmess",  interval: 3600 },
        //"节点池trojan 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?nstream=netflix,disney&type=trojan",  interval: 3600 },
        "节点池hysteria2 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?nstream=netflix,disney&type=hysteria2",  interval: 3600 },
        "节点池anytls 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?nstream=netflix,disney&type=anytls",  interval: 3600 },
        //"qhr 💚": { url: "https://fd.hief.store/api/subscribe?token=dd8aba469bed016dd8079de28d155a67",  interval: 3600 },
        //"酷可 💜": { url: "https://y.kukeyun.cc/s/363a1642a6cdc938a0384b38ad74f9b6",  interval: 3600 },

    };
    const 外部订阅 = Object.keys(config["proxy-providers"] || {});
    const 节点黑名单 = "(阻止|直连|China|🇨🇳|高倍|×10|10M|节点|过滤|剩余|流量|距离|下次|重置|重新|订阅|导入|套餐|到期|跳转|域名|请勿|邀请|好友|关注|频道|收费|就说明|被骗|续费|更新|地址|官网|下载|群组|永久|长期|中继|更换|协议|软件|教程|Lite|ali)";
    if (config["proxy-providers"]) {
        for (let 机场名 in config["proxy-providers"]) {
            let 原订阅 = config["proxy-providers"][机场名];
            if (原订阅.url) {
                const emojiMatch = 机场名.match(/[\u{1F300}-\u{1FBFF}\u{2600}-\u{27BF}]/u);
                const 自动前缀 = emojiMatch ? `${emojiMatch[0]} ` : "";
                config["proxy-providers"][机场名] = 
                    {...原订阅,
                    "type": "http",
                    "url": 原订阅.url,
                    "proxy": "DIRECT", 
                    "tfo": true,
                    "exclude-filter": `(?i)${节点黑名单}`,
                    "exclude-type": "http|ss",
                    "path": `./proxies/${机场名}.yaml`,
                    "override": {
                        "additional-prefix": 自动前缀
                    },
                    "health-check": { 
                        "enable": true, 
                        "url": "https://cp.cloudflare.com/generate_204", 
                        "interval": 300, 
                        "timeout": 2000, 
                        "max-failed-times": 3, 
                        "lazy": true, 
                        "method": "HEAD", 
                    },
                };
            }
        }
    }
    // --- ② 合并内部节点 ----------
    const 功能节点 = [
        { name: "🎯 全球直连", type: "direct", udp: true },
        { name: "🈚️ 假节点", type: "reject" },
        { name: "🚫 阻止", type: "reject" },
        { name: '🇨🇳 直连（IPv4）', type: 'direct', udp: true, 'ip-version': 'ipv4' },
        { name: '🇨🇳 直连（IPv6）', type: 'direct', udp: true, 'ip-version': 'ipv6' },
        { name: '🇨🇳 直连（IPv4优先）', type: 'direct', udp: true, 'ip-version': 'ipv4-prefer' },
        { name: '🇨🇳 直连（IPv6优先）', type: 'direct', udp: true, 'ip-version': 'ipv6-prefer' },
    ];
    const 内部过滤节点 = (config["proxies"] || []).filter(
        p => !功能节点.some(e => e.name === p.name)
    );
    config["proxies"] = [
        ...内部过滤节点,
        ...功能节点
    ];
    const 内部节点 = config["proxies"].map(p => p.name);

    // ═══════════════════════════════════
    //   二、核心协议层
    // ═══════════════════════════════════
    // --- ① 全局基础配置 ----------
    config["log-level"] = "info";
    config["port"] = 7890;
    config["socks-port"] = 7891;
    config["mixed-port"] = 7893;
    config["tproxy-port"] = 7894;
    config["ipv6"] = true;
    config["allow-lan"] = false;
    config["unified-delay"] = true;
    config["tcp-concurrent"] = true;
    config["external-controller"] = "127.0.0.1:9090";
    config["secret"] = "12345678";
    config["find-process-mode"] = "strict";
    config["profile"] = {
        "store-selected": true,
        "store-fake-ip": true
    };
    config["experimental"] = {
        "quic-go-disable-gso": false,
        "quic-go-disable-ecn": false,
        "dialer-ip4p-convert": false,
    };
    // --- ② 流量嗅探 --------------
    config["sniffer"] = {
        "enable": true,
        "force-dns-mapping": true,
        "parse-pure-ip": true,
        "override-destination": false,
        "sniff": {
            "HTTP": { "ports": [80, "8080-8880"], "override-destination": true, },
            "TLS": { "ports": [443, "5228-5230"] },
            //"QUIC": { "ports": [443, 8443, "5228-5230"] }
        },
        "force-domain": ["+.v2ex.com"],
        "skip-domain": ["+.local"],
        "skip-src-address": ["192.168.0.0/16"],
        "skip-dst-address": ["192.168.0.0/16"]
    };
    // --- ③ TUN 模式 --------------
    config["tun"] = {
        "enable": true,
        "stack": "system",
        "dns-hijack": ["any:53"],
        "auto-route": true,
        "auto-detect-interface": true,
        "strict-route": true,
        "disable-icmp-forwarding": true,
        "mtu": 4064,
        "udp-timeout": 300, // 秒
    };

    // ═══════════════════════════════════
    //   三、DNS 体系
    // ═══════════════════════════════════
    // --- ① DNS 常量模板 ----------
    const 谷歌IP = ["8.8.8.8", "8.8.4.4"];
    const 谷歌DOT = ["tls://dns.google"];
    const 谷歌DOH = ["https://dns.google/dns-query#🇬 谷歌"];
    const cloudflare_IP = ["1.1.1.1", "1.0.0.1"];
    const cloudflare_DOT = ["tls://cloudflare-dns.com"];
    const cloudflare_DOH = ["https://cloudflare-dns.com/dns-query#🖥️ 域名服务"];
    const 阿里IP = ["223.5.5.5", "223.6.6.6"];
    const 阿里DOT = ["tls://dns.alidns.com"];
    const 阿里DOH = ["https://dns.alidns.com/dns-query"];
    const 阿里QUIC = ["quic://dns.alidns.com"];
    const 阿里自建 = ["https://819431-jchlcf2024.alidns.com/dns-query"];
    const 腾讯IP = ["119.29.29.29", "120.53.53.90"];
    const 腾讯DOT = ["tls://dot.pub"];
    const 腾讯DOH = ["https://doh.pub/dns-query"];
    const 国外DNS = [
        ...谷歌DOH, 
        ...cloudflare_DOH,
    ];
    const 国内DNS = [
        //"system",
        ...阿里自建,
        //...阿里DOH,
        //...阿里QUIC,
        //...腾讯DOH,
    ];
    config["hosts"] = {
        "dns.google": 谷歌IP,
        "dns.cloudflare.com": cloudflare_IP,
        "cloudflare-dns.com": cloudflare_IP,
        "dns.alidns.com": 阿里IP,
        "doh.pub": 腾讯IP,
        "dot.pub": 腾讯IP,
        "service.googleapis.cn": "service.googleapis.com",
        "mtalk.google.com": "142.250.107.188, 108.177.125.188",
    };
    // --- ② DNS 模式配置 ----------
    config["dns"] = {
        "enable": true,
        "use-hosts": true,
        "use-system-hosts": false,
        "ipv6": true,
        "prefer-h3": true,
        "respect-rules": false,
        "proxy-server-nameserver": [
            "https://dns.alidns.com/dns-query",
            "quic://dns.alidns.com",
        ],
        "cache-algorithm": "arc",
        "listen": "127.0.0.1:1053",
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-range6": "fdfe:dcba:9876::/64",
        "fake-ip-filter-mode": "rule",
        "fake-ip-filter": [
            "GEOSITE,private,real-ip", 
            "GEOSITE,connectivity-check,real-ip",
            "RULE-SET,自用fake-ip,real-ip",
            "GEOSITE,googlefcm,real-ip",
            "GEOSITE,cn,real-ip", 
            "GEOSITE,geolocation-cn,real-ip",
            "GEOSITE,gfw,fake-ip", 
            "GEOSITE,geolocation-!cn,fake-ip",
            "MATCH,fake-ip"
        ],
        "default-nameserver": [
            "https://223.5.5.5/dns-query",
            "quic://223.5.5.5",
        ],
        "direct-nameserver": 国内DNS,
        "direct-nameserver-follow-policy": true,
        "nameserver-policy": {
            "geosite:private": 国内DNS, 
            "geosite:google@cn,googlefcm,steam": 国内DNS, 
            "geosite:cn,geolocation-cn": 国内DNS,
            //"geosite:gfw,geolocation-!cn": 国外DNS,
        },
        "nameserver": 国外DNS,
    };

    // ═══════════════════════════════════
    //   四、节点筛选层
    // ═══════════════════════════════════
    // --- ① 节点正则表达式 ---------
    const 香港正则 = "^(?!(.*(家|住))).*(港|🇭🇰|HK|Hong|HKG)";
    const 狮城正则 = '(新|🇸🇬|坡|SG|Sing|SIN|XSP)';
    const 美国正则 = "^(?!(.*(新|流量))).*(美|🇺🇸|US|USA|加|🇨🇦|CA|JFK|LAX|ORD|ATL|DFW|SFO|MIA|SEA|IAD)";
    const 日本正则 = '(日|🇯🇵|JP|Japan|NRT|HND|KIX|CTS|FUK)';
    const 韩国正则 = '(韩|🇰🇷|韓|首尔|南朝鲜|KR|KOR|Korea)';
    const 台湾正则 = '(台|🇹🇼|TW|tai|TPE|TSA|KHH)';
    const 欧盟正则 = "^(?!(.*(马来|印度|流量))).*(奥|比|保|克罗地亚|塞|捷|丹|爱沙|芬|法|德|希|匈|爱尔|意|拉|立|卢|马其它|荷|波|葡|罗|斯洛伐|斯洛文|西|瑞|英|🇧🇪|🇨🇿|🇩🇰|🇫🇮|🇫🇷|🇩🇪|🇮🇪|🇮🇹|🇱🇹|🇱🇺|🇳🇱|🇵🇱|🇸🇪|🇬🇧|CDG|FRA|AMS|MAD|BCN|FCO|MUC|BRU|GB|FR|DE|NL|RU|LV|SE|LT|AU|NZ)";
    const 汇总正则 = `${[香港正则,狮城正则,美国正则,日本正则,韩国正则,台湾正则,欧盟正则].join("|")}`;
    // --- ② 节点列表生成 ----------
    const 香港筛选 = 内部节点.filter(n => new RegExp(香港正则, "i").test(n));
    const 狮城筛选 = 内部节点.filter(n => new RegExp(狮城正则, "i").test(n));
    const 美国筛选 = 内部节点.filter(n => new RegExp(美国正则, "i").test(n));
    const 日本筛选 = 内部节点.filter(n => new RegExp(日本正则, "i").test(n));
    const 台湾筛选 = 内部节点.filter(n => new RegExp(台湾正则, "i").test(n));
    const 韩国筛选 = 内部节点.filter(n => new RegExp(韩国正则, "i").test(n));
    const 欧盟筛选 = 内部节点.filter(n => new RegExp(欧盟正则, "i").test(n));
    const 冷门_List = 内部节点.filter(n => !new RegExp(`${汇总正则}|${节点黑名单}`, "i").test(n));
    const 全部_List = 内部节点.filter(n => !new RegExp(节点黑名单, "i").test(n));
    const 香港_List = 香港筛选.length > 0 ? 香港筛选 : ["🈚️ 假节点"];
    const 狮城_List = 狮城筛选.length > 0 ? 狮城筛选 : ["🈚️ 假节点"];
    const 美国_List = 美国筛选.length > 0 ? 美国筛选 : ["🈚️ 假节点"];
    const 日本_List = 日本筛选.length > 0 ? 日本筛选 : ["🈚️ 假节点"];
    const 台湾_List = 台湾筛选.length > 0 ? 台湾筛选 : ["🈚️ 假节点"];
    const 韩国_List = 韩国筛选.length > 0 ? 韩国筛选 : ["🈚️ 假节点"];
    const 欧盟_List = 欧盟筛选.length > 0 ? 欧盟筛选 : ["🈚️ 假节点"];

    // ═══════════════════════════════════
    //   五、策略组体系
    // ═══════════════════════════════════
    // --- ① 代理列表模板 ----------
    const 节点选择池 = ["🇭🇰 香港节点", "🇺🇸 美国节点", "🇸🇬 狮城节点", "🇯🇵 日本节点", "🇹🇼 台湾节点", "🇰🇷 韩国节点", "🇪🇺 欧盟节点", "🌐 冷门自选", "🌐 全部节点"];
    const 故转节点池 = ["🇭🇰 香港故转", "🇺🇸 美国故转", "🇸🇬 狮城故转", "🇯🇵 日本故转"];
    const 自选节点池 = [...故转节点池, ...节点选择池];
    const 香港故转池 = ["🇭🇰 香港节点", "🇭🇰 香港自动", "🇸🇬 狮城节点", "🇯🇵 日本节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    const 狮城故转池 = ["🇸🇬 狮城节点", "🇸🇬 狮城自动", "🇭🇰 香港节点", "🇯🇵 日本节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    const 美国故转池 = ["🇺🇸 美国节点", "🇺🇸 美国自动", "🇪🇺 欧盟节点", "🇭🇰 香港节点", "🇸🇬 狮城节点", "🇯🇵 日本节点"];
    const 日本故转池 = ["🇯🇵 日本节点", "🇯🇵 日本自动", "🇭🇰 香港节点", "🇸🇬 狮城节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    // --- ② 策略组定义 -----------
    config["proxy-groups"] = [
        // ▸ 主要策略组 ----------
        { name: "🖥️ 服务节点", type: "select", proxies: [...自选节点池, "🇨🇳 直连"], icon: 图标库 + "ULB.png" },
        { name: "🚀 节点选择", type: "select", proxies: ["🖥️ 服务节点", "🇨🇳 直连", ...自选节点池], icon: 图标库 + "Static.png" },
        { name: "🖥️ 域名服务", type: "select", proxies: ["🖥️ 服务节点", "🇨🇳 直连", ...自选节点池], icon: 图标库 + "Cloudflare.png" },
        { name: "🇨🇳 直连", type: "select", proxies: ["🎯 全球直连"], "include-all-proxies": true, filter: '🇨🇳 直连', icon: 图标库 + "China.png" },
        { name: "🇭🇰 香港故转", type: "fallback", proxies: 香港故转池, hidden: true, icon: 图标库 + "Hong_Kong.png" },
        { name: "🇸🇬 狮城故转", type: "fallback", proxies: 狮城故转池, hidden: true, icon: 图标库 + "Singapore.png" },
        { name: "🇺🇸 美国故转", type: "fallback", proxies: 美国故转池, hidden: true, icon: 图标库 + "United_States.png" },
        { name: "🇯🇵 日本故转", type: "fallback", proxies: 日本故转池, hidden: true, icon: 图标库 + "Japan.png" },
        // ▸ 自选策略组 ----------
        { name: "📹 视频平台", type: "select", proxies: ["🚀 节点选择",  "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "YouTube.png" },
        { name: "📲 社交媒体", type: "select", proxies: ["🚀 节点选择",  "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Twitter.png" },
        { name: "📲 电报飞机", type: "select", proxies: ["🚀 节点选择",  "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Telegram_X.png" },
        { name: "🎵 音乐服务", type: "select", proxies: ["🖥️ 服务节点",  "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Spotify.png" },
        { name: "🤖 人工智能", type: "select", proxies: ["🖥️ 服务节点",  "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "ChatGPT.png" },
        { name: "🎮 game", type: "select", proxies: ["🖥️ 服务节点",  "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Game.png" },
        { name: "🇬 谷歌", type: "select", proxies: ["🖥️ 服务节点",  "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Google_Search.png" },
        { name: "🪟 Microsoft", type: "select", proxies: ["🇨🇳 直连", "🖥️ 服务节点",  "🚀 节点选择", ...自选节点池], icon: 图标库 + "Microsoft.png" },
        { name: "📈 测速地址", type: "select", proxies: ["🇨🇳 直连", "🚀 节点选择", ...自选节点池], icon: 图标库 + "Speedtest.png" },
        // ▸ 固定分流组 ----------
        { name: "👨🏿‍💻 GitHub", type: "fallback", proxies: ["🖥️ 服务节点"], icon: 图标库 + "GitHub.png", hidden: true },
        { name: "💶 PayPal", type: "fallback", proxies: ["🖥️ 服务节点"], icon: 图标库 + "PayPal.png", hidden: true },
        { name: "🎮 game@CN", type: "fallback", proxies: ["🇨🇳 直连"], icon: 图标库 + "Game.png", hidden: true },
        { name: "🪟 Bing", type: "fallback", proxies: ["🖥️ 服务节点"], icon: 图标库 + "Microsoft.png", hidden: true },
        { name: "🇬 谷歌@CN", type: "fallback", proxies: ["🇨🇳 直连"], icon: 图标库 + "Google_Search.png", hidden: true },
        { name: "🪟 Microsoft@CN", type: "fallback", proxies: ["🇨🇳 直连"], icon: 图标库 + "Microsoft.png", hidden: true },
        // ▸ 代理策略组 ----------
        { name: "🪜 代理域名", type: "fallback", proxies: ["🚀 节点选择"], hidden: true },
        { name: "🌐 自用代理", type: "fallback", proxies: ["🚀 节点选择"], hidden: true },
        { name: "⬆️ 自用直连", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        { name: "⬆️ 直连域名", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        { name: "⬆️ 直连IP", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        { name: "🔒 私有网络", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        // ▸ 功能策略组 ----------
        { name: "🖥️ 直连软件", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        { name: "🖥️ 直连服务", type: "fallback", proxies: ["🇨🇳 直连"], hidden: true },
        { name: "🖥️ 代理软件", type: "fallback", proxies: ["🖥️ 服务节点"], hidden: true },
        { name: "🖥️ 代理服务", type: "fallback", proxies: ["🖥️ 服务节点"], hidden: true },
        { name: "🚫 广告拦截", type: "select", proxies: ["🚫 阻止", "🇨🇳 直连"], icon: 图标库 + "Advertising.png", hidden: false },
        { name: "🚫 追踪拦截", type: "fallback", proxies: ["🚫 阻止"], icon: 图标库 + "AdBlack.png", hidden: true },
        // ▸ 生成地区组 ----------
        ...创建地区分组("🇭🇰 香港", "Hong_Kong.png", 香港_List, 香港筛选, `${香港正则}`),
        ...创建地区分组("🇸🇬 狮城", "Singapore.png", 狮城_List, 狮城筛选, `${狮城正则}`),
        ...创建地区分组("🇺🇸 美国", "United_States.png", 美国_List, 美国筛选, `${美国正则}`),
        ...创建地区分组("🇯🇵 日本", "Japan.png", 日本_List, 日本筛选, `${日本正则}`),
        ...创建地区分组("🇹🇼 台湾", "Taiwan.png", 台湾_List, 台湾筛选, `${台湾正则}`),
        ...创建地区分组("🇰🇷 韩国", "Korea.png", 韩国_List, 韩国筛选, `${韩国正则}`),
        ...创建地区分组("🇪🇺 欧盟", "European_Union.png", 欧盟_List, 欧盟筛选, `${欧盟正则}`),
        // ▸ 其他策略组 ----------
        { name: "🌐 冷门自选", type: "select", use: 外部订阅, "exclude-filter": `(?i)(${汇总正则})`, proxies: ["🈚️ 假节点", ...冷门_List], icon: 图标库 + "Europe_Map.png" },
        { name: "🌐 全部节点", type: "select", use: 外部订阅, proxies: ["🈚️ 假节点", ...全部_List], icon: 图标库 + "Clubhouse.png" },
        { name: "🐟 漏网之鱼", type: "select", proxies: ["🚀 节点选择", "🇨🇳 直连"], icon: 图标库 + "Final.png" }
    ];

    // ═══════════════════════════════════
    //   六、规则体系
    // ═══════════════════════════════════
    // --- ① 规则提供器 -----------
    const classical_yaml = { type: "http", interval: 300, behavior: "classical", format: "yaml" };
    const domain_yaml = { type: "http", interval: 300, behavior: "domain", format: "yaml" };
    config["rule-providers"] = {
        "自用直连规则": { ...classical_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/自用直连.yaml" },
        "自用代理规则": { ...classical_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/自用代理.yaml" },
        "自用直连软件": { ...classical_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/直连软件.yaml" },
        "自用代理软件": { ...classical_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/代理软件.yaml" },
        "前置直连规则": { ...classical_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/前置直连.yaml" },
        "自用fake-ip": { ...domain_yaml, url: "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Rule/fake-ip-filter.yaml" }
    };
    // --- ② 规则列表 --------------
    config["rules"] = [
        // ▸ 前置规则 ------------
        "OR,((GEOSITE,private),(GEOIP,private,no-resolve)),🔒 私有网络",
        "RULE-SET,前置直连规则,⬆️ 自用直连",
        "OR,((GEOSITE,tracker),(GEOSITE,category-public-tracker)),🚫 追踪拦截",
        "OR,((GEOSITE,category-ads-all),(GEOIP,ad,no-resolve)),🚫 广告拦截",
        "RULE-SET,自用代理规则,🌐 自用代理",
        "RULE-SET,自用直连规则,⬆️ 自用直连",
        "RULE-SET,自用代理软件,🖥️ 代理软件",
        "RULE-SET,自用直连软件,🖥️ 直连软件",
        // ▸ 直连规则 ------------
        "OR,((GEOSITE,category-games-cn),(GEOSITE,steam@cn),(GEOSITE,category-game-platforms-download)),🎮 game@CN",
        "GEOSITE,ookla-speedtest,📈 测速地址",
        "GEOSITE,microsoft@cn,🪟 Microsoft@CN",
        "OR,((GEOSITE,google@cn),(GEOSITE,googlefcm)),🇬 谷歌@CN",
        "OR,((GEOSITE,cloudflare@cn),(GEOIP,cloudfront,no-resolve)),🖥️ 直连服务",
        // ▸ 代理规则 ------------
        //"AND,((NETWORK,UDP),(DST-PORT,443)),REJECT",  
        //"AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((GEOIP,CN)))),REJECT",
        "GEOSITE,category-games-!cn,🎮 game",
        "OR,((GEOSITE,openai),(GEOSITE,google-gemini),(GEOSITE,category-ai-!cn)),🤖 人工智能",
        "GEOSITE,spotify,🎵 音乐服务",
        "GEOSITE,paypal,💶 PayPal",
        "GEOSITE,github,👨🏿‍💻 GitHub",
        "GEOSITE,bing,🪟 Bing",
        "OR,((GEOSITE,twitter),(GEOSITE,tiktok),(GEOSITE,Reddit),(GEOSITE,discord),(GEOSITE,vk),(GEOSITE,facebook),(GEOSITE,instagram)),📲 社交媒体",
        "OR,((GEOSITE,telegram),(GEOIP,telegram,no-resolve)),📲 电报飞机",
        "AND,((NETWORK,UDP),(DST-PORT,443),(GEOSITE,youtube)),REJECT",   
        "OR,((GEOSITE,youtube),(GEOSITE,netflix),(GEOSITE,twitch),(GEOSITE,disney),(GEOSITE,biliintl),(GEOSITE,category-porn)),📹 视频平台",
        "OR,((GEOSITE,cloudflare),(GEOIP,cloudflare,no-resolve)),🖥️ 代理服务",
        "OR,((GEOSITE,microsoft),(GEOIP,microsoft,no-resolve)),🪟 Microsoft",
        "OR,((GEOSITE,google),(GEOIP,google,no-resolve)),🇬 谷歌",
        // ▸ 兜底规则 ------------
        "GEOSITE,gfw,🪜 代理域名",
        //"OR,((GEOSITE,cn),(GEOSITE,geolocation-cn)),⬆️ 直连域名",
        "GEOIP,cn,⬆️ 直连IP",
        "MATCH,🐟 漏网之鱼"
    ];

    // ═══════════════════════════════════
    //   七、工具函数
    // ═══════════════════════════════════
    // --- ① 创建地区分组 ----------
    function 创建地区分组(地区名, 地区图标, 选择池, 测速池, 地区正则) {
        return [
            { name: `${地区名}节点`, type: "select", use: 外部订阅, filter: `(?i)${地区正则}`, proxies: [`${地区名}自动`, `${地区名}散列`, `${地区名}轮询`, ...选择池], icon: 图标库 + 地区图标 },
            { name: `${地区名}自动`, type: "url-test", use: 外部订阅, filter: `(?i)${地区正则}`, proxies: 测速池, hidden: true, icon: 图标库 + 地区图标, interval: 300, url: "https://cp.cloudflare.com/generate_204", timeout: 2000, "max-failed-times": 3, method: "HEAD", lazy: false },
            { name: `${地区名}散列`, type: "load-balance", strategy: "consistent-hashing", use: 外部订阅, filter: `(?i)${地区正则}`, proxies: 测速池, hidden: true, icon: 图标库 + 地区图标, interval: 300, url: "https://cp.cloudflare.com/generate_204", timeout: 2000, "max-failed-times": 3, method: "HEAD", lazy: true },
            { name: `${地区名}轮询`, type: "load-balance", strategy: "round-robin", use: 外部订阅, filter: `(?i)${地区正则}`, proxies: 测速池, hidden: true, icon: 图标库 + 地区图标, interval: 300, url: "https://cp.cloudflare.com/generate_204", timeout: 2000, "max-failed-times": 3, method: "HEAD", lazy: true }
        ];
    }

    return config;
}
