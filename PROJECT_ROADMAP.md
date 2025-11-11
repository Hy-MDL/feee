# Nexus-Alpha Project Roadmap
**Complete Financial Platform with Advanced Theory & Simulation**

## 현재 상태 (Current State)
✅ Platform Dashboard with scenario voting
✅ Time-based simulation with smooth interpolation
✅ 3D Globe & Network visualization
✅ Multiple supply chain themes
✅ Compact UI (DateSimulator overflow fixed)

---

## Phase 1: Core Financial Theory (금융 이론)
**목표**: 모든 기본 금융 이론을 코드로 구현

### 1.1 Option Pricing (옵션 가격)
- [ ] **Black-Scholes Model**
  - Call/Put option pricing
  - Greeks calculation (Delta, Gamma, Theta, Vega, Rho)
  - Implied volatility solver
- [ ] **Binomial Tree Model**
  - American options
  - Multi-period valuation
- [ ] **Monte Carlo Simulation**
  - Path-dependent options
  - Variance reduction techniques
- [ ] **Option Strategies Visualizer**
  - Covered Call, Protective Put
  - Straddle, Strangle, Iron Condor
  - Butterfly, Calendar Spreads
  - P&L diagrams at expiration

### 1.2 Portfolio Theory (포트폴리오 이론)
- [ ] **Markowitz Mean-Variance Optimization**
  - Efficient frontier calculation
  - Minimum variance portfolio
  - Tangency portfolio (max Sharpe ratio)
- [ ] **CAPM (Capital Asset Pricing Model)**
  - Beta calculation
  - Expected return estimation
  - Security Market Line
- [ ] **APT (Arbitrage Pricing Theory)**
  - Multi-factor models
  - Fama-French 3-factor, 5-factor
  - Factor loading estimation
- [ ] **Risk Parity**
  - Equal risk contribution
  - Volatility targeting

### 1.3 Risk Management (리스크 관리)
- [ ] **Value at Risk (VaR)**
  - Historical simulation
  - Variance-covariance method
  - Monte Carlo VaR
- [ ] **Conditional Value at Risk (CVaR/ES)**
  - Expected Shortfall calculation
  - Tail risk metrics
- [ ] **Stress Testing**
  - Scenario analysis
  - Sensitivity analysis
  - Historical stress events (2008, 2020)
- [ ] **Correlation & Copulas**
  - Correlation matrices
  - Gaussian copulas
  - t-copulas for tail dependence

### 1.4 Fixed Income (채권)
- [ ] **Bond Pricing**
  - YTM (Yield to Maturity)
  - Duration & Convexity
  - Clean vs Dirty price
- [ ] **Yield Curve**
  - Bootstrapping
  - Nelson-Siegel model
  - Forward rates
- [ ] **Credit Risk**
  - Credit spread
  - Default probability (Merton model)
  - CDS pricing

---

## Phase 2: Advanced Asset Classes (고급 자산)

### 2.1 Derivatives (파생상품)
- [ ] **Futures**
  - Futures pricing (cost of carry)
  - Basis & convergence
  - Calendar spreads
- [ ] **Swaps**
  - Interest rate swaps
  - Currency swaps
  - Swap valuation
- [ ] **Exotic Options**
  - Barrier options
  - Asian options
  - Lookback options

### 2.2 Alternative Investments (대체 투자)
- [ ] **Private Equity**
  - Valuation methods (DCF, Multiples)
  - IRR & MOIC
  - Waterfall distributions
- [ ] **Real Estate**
  - Cap rate calculation
  - NOI & Cash Flow
  - REIT analysis
- [ ] **Commodities**
  - Contango & Backwardation
  - Roll yield
  - Commodity indices

### 2.3 Cryptocurrency (암호화폐)
- [ ] **On-chain Metrics**
  - NVT ratio
  - MVRV ratio
  - Active addresses
- [ ] **DeFi Analytics**
  - TVL tracking
  - Impermanent loss calculator
  - APY vs APR
- [ ] **Crypto Correlations**
  - BTC dominance
  - Altcoin beta to BTC
  - Cross-asset correlations

---

## Phase 3: Corporate Finance & Linkages (기업 금융 & 연계)

### 3.1 Company Fundamentals (기업 기초)
- [ ] **Financial Statement Analysis**
  - Ratio analysis (30+ ratios)
  - DuPont analysis
  - Cash flow analysis
- [ ] **Valuation Models**
  - DCF (Discounted Cash Flow)
  - Comparable Companies
  - Precedent Transactions
  - LBO model
- [ ] **Credit Analysis**
  - Altman Z-Score
  - Piotroski F-Score
  - Beneish M-Score (fraud detection)

### 3.2 Supply Chain Linkages (공급망 연계)
- [ ] **Input-Output Analysis**
  - Upstream/downstream dependencies
  - Network centrality measures
  - Critical path identification
- [ ] **Real Supply Chain Data**
  - NVIDIA: TSMC (5nm/3nm wafer) + SK Hynix (HBM3E) + CoWoS packaging
  - Apple: TSMC + Samsung Display + Foxconn assembly
  - Tesla: CATL/Panasonic (batteries) + semiconductor suppliers
  - Auto: Steel (POSCO) + Semiconductors + Tires
- [ ] **Just-in-Time vs Inventory**
  - Inventory turnover
  - Supply chain resilience metrics
  - Bullwhip effect simulation

### 3.3 Cross-Shareholding (상호 지분)
- [ ] **Ownership Networks**
  - Circular ownership detection
  - Ultimate beneficial owner
  - Voting rights vs cash flow rights
- [ ] **Chaebol Structure (한국 재벌)**
  - Samsung Group structure
  - Hyundai Motor Group
  - SK Group
  - LG Group
- [ ] **Keiretsu (일본 계열사)**
  - Mitsubishi, Mitsui, Sumitomo
  - Cross-shareholding ratios
  - Bank relationships

### 3.4 M&A & Restructuring (인수합병 & 구조조정)
- [ ] **M&A Impact Modeling**
  - Synergy estimation
  - Accretion/dilution analysis
  - Integration risk
- [ ] **Spin-offs & Carve-outs**
  - Valuation impact
  - Market reaction
- [ ] **Bankruptcy & Distress**
  - Debt restructuring
  - Recovery rates
  - Distressed debt investing

---

## Phase 4: Hedge Funds & Institutional (헷지펀드 & 기관)

### 4.1 Famous Hedge Fund Strategies
- [ ] **Bridgewater Associates (Ray Dalio)**
  - All Weather Portfolio
  - Risk Parity implementation
- [ ] **Renaissance Technologies**
  - Statistical arbitrage
  - Mean reversion strategies
- [ ] **Citadel (Ken Griffin)**
  - Multi-strategy approach
  - Market making
- [ ] **Two Sigma**
  - Machine learning signals
  - Factor models
- [ ] **AQR Capital**
  - Style premia (Value, Momentum, Carry, Defensive)
  - Alternative risk premia

### 4.2 Portfolio Tracking (13F Filings)
- [ ] **Top Holders Database**
  - Berkshire Hathaway positions
  - Ark Invest holdings
  - Tiger Management clones
- [ ] **Position Changes**
  - Quarter-over-quarter changes
  - New positions vs exits
  - Position sizing
- [ ] **Crowding Analysis**
  - Most popular stocks
  - Hedge fund concentration
  - Liquidation risk

### 4.3 Trading Strategies (실전 전략)
- [ ] **Long/Short Equity**
  - Pair trading
  - Sector neutral
  - Market neutral
- [ ] **Stat Arb**
  - Cointegration
  - Kalman filter
  - PCA factors
- [ ] **Event Driven**
  - Merger arbitrage
  - Earnings surprises
  - Activist campaigns
- [ ] **Global Macro**
  - Currency carry trade
  - Commodity trends
  - Intermarket relationships

### 4.4 Institutional Ownership (기관 투자자)
- [ ] **Institutional Holdings Data**
  - Vanguard, BlackRock, State Street positions
  - Mutual fund holdings
  - Pension fund allocations
- [ ] **Smart Money Tracking**
  - Insider buying/selling
  - Institutional accumulation
  - Insider ownership %
- [ ] **Activist Investors**
  - Carl Icahn campaigns
  - Elliott Management
  - Pershing Square (Bill Ackman)

---

## Phase 5: Advanced Simulation & AI (시뮬레이션 & AI)

### 5.1 Agent-Based Modeling
- [ ] **Market Microstructure**
  - Order book simulation
  - Market makers vs noise traders
  - Flash crash scenarios
- [ ] **Systemic Risk**
  - Bank contagion
  - Liquidity spirals
  - Fire sale cascades

### 5.2 Machine Learning Integration
- [ ] **Predictive Models**
  - Stock return prediction
  - Volatility forecasting (GARCH, EGARCH)
  - Sentiment analysis
- [ ] **Reinforcement Learning**
  - Optimal execution (VWAP, TWAP, POV)
  - Portfolio management
  - Market making

### 5.3 Macro-Micro Linkage Enhancement
- [ ] **Transmission Mechanisms**
  - Fed rate → Bond yields → Stock multiples
  - Currency → Export competitiveness → Earnings
  - Oil price → Inflation → Monetary policy
- [ ] **Cascade Effects Visualization**
  - Animated flows (물줄기)
  - Time delays
  - Amplification factors

---

## Phase 6: Data & Visualization (데이터 & 시각화)

### 6.1 Real Data Integration (실제 데이터)
- [ ] **Financial Data**
  - Yahoo Finance API
  - Alpha Vantage
  - Federal Reserve FRED
- [ ] **Alternative Data**
  - Satellite imagery (parking lots)
  - Credit card data
  - Web scraping (job postings)
- [ ] **Economic Indicators**
  - GDP, CPI, unemployment
  - PMI, consumer confidence
  - Housing starts, retail sales

### 6.2 Advanced Visualization
- [ ] **Interactive Charts**
  - Candlestick with indicators
  - Volume profile
  - Market depth (L2 data)
- [ ] **Network Graphs**
  - Force-directed layout improvements
  - Community detection
  - Time-series networks
- [ ] **Heatmaps & Correlation**
  - Sector rotation
  - Factor exposures
  - Geographic exposure

---

## Phase 7: Backtesting & Performance (백테스트 & 성과)

### 7.1 Strategy Backtesting
- [ ] **Backtesting Engine**
  - Event-driven architecture
  - Transaction costs
  - Slippage modeling
- [ ] **Performance Attribution**
  - Brinson attribution
  - Factor attribution
  - Risk-adjusted metrics (Sharpe, Sortino, Calmar)
- [ ] **Walk-Forward Optimization**
  - In-sample vs out-of-sample
  - Rolling window
  - Overfitting detection

### 7.2 Risk Analytics
- [ ] **Real-time Risk Dashboard**
  - Portfolio VaR
  - Stress tests
  - Concentration risk
- [ ] **Scenario Analysis**
  - Historical scenarios
  - Hypothetical scenarios
  - Reverse stress testing

---

## Phase 8: User Features (사용자 기능)

### 8.1 Personalization
- [ ] **Custom Portfolios**
  - User-created portfolios
  - Position tracking
  - P&L tracking
- [ ] **Watchlists & Alerts**
  - Price alerts
  - News alerts
  - Earnings calendar

### 8.2 Community Features
- [ ] **Scenario Sharing (Enhanced)**
  - Comments & discussions
  - Upvote/downvote (already done)
  - Leaderboard
- [ ] **Research Reports**
  - User-generated reports
  - AI-assisted writing
  - Collaborative editing

### 8.3 Educational Content
- [ ] **Interactive Tutorials**
  - Option strategies guide
  - Portfolio theory lessons
  - Risk management tutorials
- [ ] **Glossary & Definitions**
  - Financial terms
  - Formula explanations
  - Examples

---

## Implementation Priority (구현 우선순위)

### 🔴 Critical (Phase 1 - Week 1-2)
1. Option Pricing (Black-Scholes + Greeks)
2. Portfolio Optimization (Markowitz Efficient Frontier)
3. VaR & Risk Metrics
4. Supply Chain Real Data (NVIDIA → TSMC → SK Hynix)

### 🟡 High Priority (Phase 2 - Week 3-4)
1. Fixed Income (Bond pricing, Yield Curve)
2. Cross-Shareholding Networks
3. Hedge Fund Portfolio Tracking (13F)
4. Crypto Analytics

### 🟢 Medium Priority (Phase 3 - Week 5-6)
1. Derivatives (Futures, Swaps)
2. M&A Impact Modeling
3. Trading Strategies (Long/Short, Pair Trading)
4. Agent-Based Modeling

### 🔵 Enhancement (Phase 4 - Week 7-8)
1. Machine Learning Integration
2. Real Data APIs
3. Advanced Visualization
4. Backtesting Engine

---

## Technical Architecture

### Frontend Stack
- Next.js 14 (App Router)
- React Three Fiber (3D visualizations)
- Recharts (2D charts)
- Zustand (State management)
- Tailwind CSS

### Computation Libraries
- **Financial Math**: `financial` npm package, custom implementations
- **Linear Algebra**: `mathjs` for matrix operations
- **Optimization**: `optimization-js` for portfolio optimization
- **Statistics**: `simple-statistics`, `jstat`
- **Time Series**: custom GARCH, ARIMA implementations

### Data Storage
- **Local**: Zustand persist middleware
- **Future**: Supabase/PostgreSQL for user data
- **Real-time**: WebSocket for live prices

---

## Success Metrics

### Functionality
- [ ] 50+ financial formulas implemented
- [ ] 100+ companies with supply chain data
- [ ] 20+ hedge fund portfolios tracked
- [ ] 10+ trading strategies backtestable

### User Experience
- [ ] <100ms visualization update latency
- [ ] Responsive on mobile
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Dark mode optimized

### Community
- [ ] 100+ scenarios created
- [ ] 1000+ votes cast
- [ ] 50+ research reports

---

## Next Immediate Steps

1. ✅ **Fix DateSimulator overflow** (DONE)
2. **Implement Black-Scholes Model** (START HERE)
   - Create `/lib/financial/blackScholes.ts`
   - Greeks calculator
   - Implied volatility solver
3. **Portfolio Optimization**
   - Efficient frontier
   - Sharpe ratio maximization
4. **NVIDIA Supply Chain Detailed Data**
   - TSMC wafer allocation
   - SK Hynix HBM3E capacity
   - Customer allocation (Microsoft, Meta, Google)

---

## 작업 진행 방식

1. **Theory First**: 각 금융 이론을 먼저 정확히 구현
2. **Visualization**: Interactive한 시각화로 이해도 증진
3. **Real Data**: 실제 데이터로 검증
4. **Integration**: 기존 시스템과 통합
5. **Testing**: Edge cases 테스트

**지금 바로 Phase 1.1 (Option Pricing) 시작하시겠습니까?**
