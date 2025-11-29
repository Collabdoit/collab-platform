'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import styles from './Chatbot.module.css';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Chatbot');
    const locale = useLocale();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0 && isOpen) {
            setIsTyping(true);
            setTimeout(() => {
                setMessages([
                    {
                        id: '1',
                        text: t('greeting'),
                        sender: 'bot',
                        timestamp: new Date(),
                    },
                ]);
                setIsTyping(false);
            }, 1000);
        }
    }, [isOpen, t]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI processing delay
        setTimeout(() => {
            const botResponse = generateResponse(userMsg.text);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: botResponse,
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (text: string): string => {
        const lowerText = text.toLowerCase();

        // Keywords for both languages
        const pricingKeywords = ['pricing', 'cost', 'price', 'سعر', 'باقات', 'اسعار', 'تكلفة'];
        const registerKeywords = ['register', 'sign up', 'join', 'تسجيل', 'انضمام', 'اشتراك', 'حساب'];
        const contactKeywords = ['contact', 'support', 'help', 'تواصل', 'مساعدة', 'دعم', 'اتصل'];
        const helloKeywords = ['hello', 'hi', 'hey', 'مرحبا', 'هلا', 'اهلين', 'السلام'];

        if (pricingKeywords.some(k => lowerText.includes(k))) {
            return t('responses.pricing');
        }

        if (registerKeywords.some(k => lowerText.includes(k))) {
            return t('responses.register');
        }

        if (contactKeywords.some(k => lowerText.includes(k))) {
            return t('responses.contact');
        }

        if (helloKeywords.some(k => lowerText.includes(k))) {
            return t('responses.hello');
        }

        return t('responses.default');
    };

    // Helper to render text with links
    const renderMessageText = (text: string) => {
        const parts = text.split(/(\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                return <Link key={index} href={match[2]} className="text-primary underline hover:text-primary-dark">{match[1]}</Link>;
            }
            return part;
        });
    };

    return (
        <div className={styles.chatbotContainer} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                            <Bot size={24} color="white" />
                        </div>
                        <div className={styles.headerInfo}>
                            <h3>{t('title')}</h3>
                            <p>{t('subtitle')}</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.message} ${msg.sender === 'bot' ? styles.botMessage : styles.userMessage}`}>
                                {renderMessageText(msg.text)}
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <div className={styles.typingIndicator}>
                                    <div className={styles.typingDot}></div>
                                    <div className={styles.typingDot}></div>
                                    <div className={styles.typingDot}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={t('placeholder')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
