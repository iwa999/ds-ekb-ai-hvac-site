```tsx
import './globals.css';	
import { ReactNode } from 'react';	

export const metadata = {
title: 'DS EKB AI HVAC',
description: 'AI HVAC диагностика за 2 минуты',
};

export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="ru">
<body>{children}</body>
</html>
);
}
