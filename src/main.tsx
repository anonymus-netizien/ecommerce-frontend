import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {CartProvider} from './context/CartProvider'
import {OrderProvider} from './context/OrderProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <OrderProvider>
                <CartProvider>
                    <App/>
                </CartProvider>
            </OrderProvider>
        </BrowserRouter>
    </StrictMode>,
)
