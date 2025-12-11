import React from 'react';
import './UrduContent.css';

const UrduContent = ({ content, isUrdu = false }) => {
  return (
    <div className={`urdu-content-container ${isUrdu ? 'urdu-mode' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {isUrdu ? (
        <div className="urdu-text">
          {/* Urdu content would be displayed here */}
          <div className="urdu-paragraph">
            {content || 'یہ جدید روبوٹکس کے بارے میں ایک مثالی مواد ہے۔ یہاں آپ انسان نما روبوٹس کے بارے میں تفصیلی معلومات حاصل کر سکتے ہیں۔'}
          </div>
          <div className="urdu-technical-terms">
            <p><strong>ٹیکنیکل اصطلاحات:</strong></p>
            <p><code>روبوٹ (Robot)</code> - ایک خودکار مشین جو انسانی سرگرمیوں کو نقل کر سکتی ہے</p>
            <p><code>ہیومنوائڈ (Humanoid)</code> - انسان کی طرح شکل رکھنے والا روبوٹ</p>
            <p><code>AI (مصنوعی ذہانت)</code> - مشینوں میں ذہانت کی نقل کرنا</p>
          </div>
        </div>
      ) : (
        <div className="english-text">
          {/* English content would be displayed here */}
          <div className="english-paragraph">
            {content || 'This is sample content about modern robotics. Here you can learn about humanoid robots in detail.'}
          </div>
          <div className="english-technical-terms">
            <p><strong>Technical Terms:</strong></p>
            <p><code>Robot</code> - An automated machine that can imitate human activities</p>
            <p><code>Humanoid</code> - A robot with human-like appearance</p>
            <p><code>AI (Artificial Intelligence)</code> - Imitating intelligence in machines</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrduContent;