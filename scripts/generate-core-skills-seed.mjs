/**
 * Generates src/shared/core-skills-seed.ts from curated category lists.
 * Run: node scripts/generate-core-skills-seed.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../src/shared/core-skills-seed.ts');

/** @type {Record<string, string[]>} */
const SKILL_CATALOG_BY_CATEGORY = {
  'Programming Languages': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'C++', 'C', 'Go', 'Rust', 'Kotlin',
    'Swift', 'Ruby', 'PHP', 'Scala', 'R', 'SQL', 'HTML', 'CSS', 'Bash', 'PowerShell', 'Dart',
    'Objective-C', 'Perl', 'MATLAB', 'Haskell', 'Clojure', 'Elixir', 'Erlang', 'F#', 'Lua',
    'Groovy', 'Assembly', 'Fortran', 'COBOL', 'Julia', 'Solidity', 'VBA', 'ABAP', 'Apex',
    'Visual Basic', 'Delphi', 'Pascal', 'Prolog', 'Scheme', 'Lisp', 'Crystal', 'Nim', 'Zig',
    'OCaml', 'ReasonML', 'Chapel', 'Ada', 'VHDL', 'Verilog', 'SystemVerilog', 'Tcl', 'AWK',
    'Shell Scripting', 'WebAssembly', 'ActionScript', 'ColdFusion', 'Hack', 'Q#', 'CUDA',
    'OpenCL', 'GLSL', 'HLSL', 'Metal', 'Embedded C', 'Embedded C++', 'MicroPython', 'GDScript',
    'SAS', 'Stata', 'SPSS', 'APL', 'Forth', 'Logo', 'Smalltalk', 'Racket', 'Standard ML',
    'Modula-2', 'D', 'Vala', 'Carbon', 'Mojo', 'V', 'Ring', 'PureBasic', 'XQuery', 'XPath',
    'JSON', 'YAML', 'TOML', 'Markdown', 'LaTeX', 'Regular Expressions',
  ],

  'Web Frontend': [
    'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit', 'SolidJS', 'Qwik',
    'Preact', 'Alpine.js', 'Ember.js', 'Backbone.js', 'Knockout.js', 'Meteor', 'Astro', 'Remix',
    'Gatsby', 'Redux', 'Redux Toolkit', 'Zustand', 'MobX', 'Recoil', 'Jotai', 'TanStack Query',
    'React Query', 'SWR', 'RxJS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'MUI', 'Chakra UI',
    'Ant Design', 'Semantic UI', 'Bulma', 'Foundation', 'Radix UI', 'Headless UI', 'shadcn/ui',
    'Sass', 'SCSS', 'Less', 'PostCSS', 'Styled Components', 'Emotion', 'CSS Modules', 'CSS-in-JS',
    'Tailwind UI', 'Bootstrap Vue', 'Vuetify', 'Quasar', 'Element UI', 'PrimeReact', 'PrimeVue',
    'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'Turbopack', 'Babel', 'SWC', 'jQuery',
    'Responsive Web Design', 'Web Accessibility', 'WCAG 2.1', 'ARIA', 'Progressive Web Apps',
    'Web Components', 'Lit', 'Stencil', 'HTMX', 'Three.js', 'D3.js', 'Chart.js', 'ECharts',
    'Highcharts', 'Recharts', 'Victory', 'Leaflet', 'Mapbox GL JS', 'Google Maps API',
    'Framer Motion', 'GSAP', 'Anime.js', 'Lottie', 'Storybook', 'Design Systems',
    'Cross-browser Compatibility', 'Core Web Vitals', 'Lighthouse', 'Single Page Applications',
    'Server Side Rendering', 'Static Site Generation', 'Islands Architecture', 'Micro Frontends',
    'Module Federation', 'Hot Module Replacement', 'Web Vitals Optimization', 'Image Optimization',
    'Lazy Loading', 'Code Splitting', 'Service Workers', 'IndexedDB', 'Local Storage',
    'Canvas API', 'WebGL', 'WebGPU', 'WebRTC', 'Web Audio API', 'Intersection Observer',
    'Mutation Observer', 'Fetch API', 'Axios', 'TanStack Router', 'React Router', 'Vue Router',
    'Angular Router', 'Formik', 'React Hook Form', 'Yup', 'Zod', 'React Testing Library',
    'Vue Test Utils', 'Enzyme', 'Vitest', 'VitePress', 'Docusaurus', 'Eleventy', 'Hugo',
  ],

  'Web Backend': [
    'Node.js', 'Express.js', 'NestJS', 'Fastify', 'Koa', 'Hapi', 'AdonisJS', 'Django', 'Flask',
    'FastAPI', 'Starlette', 'Tornado', 'Pyramid', 'Spring Boot', 'Spring Framework', 'Spring MVC',
    'Spring Security', 'Spring Data', 'Quarkus', 'Micronaut', 'Jakarta EE', 'Java EE', '.NET',
    'ASP.NET Core', 'ASP.NET MVC', 'ASP.NET Web API', 'Blazor', 'Ruby on Rails', 'Sinatra',
    'Laravel', 'Symfony', 'CodeIgniter', 'CakePHP', 'Gin', 'Echo', 'Fiber', 'Chi', 'Buffalo',
    'Phoenix', 'Plug', 'Actix Web', 'Rocket', 'Warp', 'Axum', 'GraphQL', 'Apollo Server',
    'GraphQL Yoga', 'REST APIs', 'RESTful Services', 'OpenAPI', 'Swagger', 'gRPC', 'Protocol Buffers',
    'WebSockets', 'Socket.io', 'SignalR', 'Server-Sent Events', 'Apache Kafka', 'RabbitMQ',
    'ActiveMQ', 'Amazon SQS', 'Amazon SNS', 'Google Pub/Sub', 'Azure Service Bus', 'NATS',
    'Redis Pub/Sub', 'Apache Pulsar', 'ZeroMQ', 'Nginx', 'Apache HTTP Server', 'Caddy', 'Traefik',
    'HAProxy', 'API Gateway', 'Kong', 'Tyk', 'OAuth 2.0', 'OpenID Connect', 'SAML', 'JWT',
    'Session Management', 'Rate Limiting', 'Caching Strategies', 'CDN Integration', 'Load Balancing',
    'Reverse Proxy', 'Webhooks', 'Batch Processing', 'Background Jobs', 'Sidekiq', 'Celery',
    'BullMQ', 'Hangfire', 'Quartz Scheduler', 'Cron Jobs', 'Serverless Functions', 'Edge Functions',
    'BFF Pattern', 'API Versioning', 'HATEOAS', 'JSON-RPC', 'SOAP', 'WSDL', 'XML', 'JSON Schema',
    'Protobuf', 'Avro', 'MessagePack', 'Thrift', 'WebAssembly Backend', 'Serverless Framework',
  ],

  'Mobile Development': [
    'React Native', 'Expo', 'Flutter', 'Dart Mobile', 'SwiftUI', 'UIKit', 'Android SDK',
    'Jetpack Compose', 'Android Jetpack', 'Kotlin Multiplatform', 'Xamarin', 'Xamarin.Forms',
    'MAUI', '.NET MAUI', 'Ionic', 'Capacitor', 'Cordova', 'PhoneGap', 'NativeScript',
    'iOS Development', 'Android Development', 'Mobile UI Design', 'Mobile App Architecture',
    'Mobile Performance Optimization', 'Mobile Security', 'App Store Deployment', 'Google Play Deployment',
    'TestFlight', 'Firebase Cloud Messaging', 'Push Notifications', 'Deep Linking', 'Universal Links',
    'Mobile Analytics', 'Crashlytics', 'Mobile CI/CD', 'Fastlane', 'Appium', 'Detox', 'Espresso',
    'XCUITest', 'Mobile Accessibility', 'Offline-First Mobile', 'SQLite Mobile', 'Realm Mobile',
    'Core Data', 'Room Database', 'HealthKit', 'ARKit', 'ARCore', 'Core ML', 'TensorFlow Lite',
    'Mobile Payment Integration', 'Apple Pay', 'Google Pay', 'In-App Purchases', 'Bluetooth LE',
    'NFC', 'Geolocation APIs', 'Camera APIs', 'Biometric Authentication', 'Face ID', 'Touch ID',
    'Wear OS', 'watchOS', 'tvOS', 'Android TV', 'CarPlay', 'Android Auto',
  ],

  'Desktop & Cross-Platform': [
    'Electron', 'Tauri', 'Qt', 'GTK', 'wxWidgets', 'JavaFX', 'Swing', 'AWT', 'WPF', 'WinForms',
    'UWP', 'Windows App SDK', 'macOS Development', 'Windows Desktop Development', 'Linux Desktop Development',
    'Cross-Platform Desktop', 'PyQt', 'PySide', 'Kivy', 'Tkinter', 'Dear PyGui', 'ImGui',
    'Avalonia UI', 'Uno Platform', 'Photino', 'Neutralino', 'NW.js',
  ],

  'Game Development': [
    'Unity', 'Unreal Engine', 'Godot', 'GameMaker Studio', 'CryEngine', 'Lumberyard', 'Cocos2d',
    'Phaser', 'PixiJS', 'Babylon.js', 'PlayCanvas', 'Game Design', 'Level Design', '3D Modeling',
    'Blender', 'Maya', '3ds Max', 'ZBrush', 'Substance Painter', 'Substance Designer', 'Houdini',
    'Spine', 'DragonBones', 'Game Physics', 'Game AI', 'Multiplayer Networking', 'Photon',
    'Mirror Networking', 'Steamworks', 'OpenGL', 'DirectX', 'Vulkan', 'Metal API', 'Shader Programming',
    'Game Optimization', 'Procedural Generation', 'Game Audio', 'FMOD', 'Wwise', 'Unity DOTS',
    'Unreal Blueprints', 'GDScript Game Dev', 'Roblox Studio', 'Minecraft Modding',
  ],

  'Embedded & IoT': [
    'Embedded Systems', 'Firmware Development', 'RTOS', 'FreeRTOS', 'Zephyr', 'Embedded Linux',
    'Yocto Project', 'Buildroot', 'ARM Architecture', 'RISC-V', 'Microcontrollers', 'Arduino',
    'Raspberry Pi', 'ESP32', 'ESP8266', 'STM32', 'PIC Microcontrollers', 'FPGA', 'FPGA Programming',
    'IoT Protocols', 'MQTT', 'CoAP', 'LoRaWAN', 'Zigbee', 'Z-Wave', 'BLE Development',
    'IoT Cloud Platforms', 'AWS IoT Core', 'Azure IoT Hub', 'Google Cloud IoT', 'Edge Computing',
    'Industrial IoT', 'SCADA', 'PLC Programming', 'Modbus', 'OPC UA', 'CAN Bus', 'Device Drivers',
    'Hardware Debugging', 'JTAG', 'Oscilloscope', 'Logic Analyzer', 'Sensor Integration',
  ],

  'Databases': [
    'PostgreSQL', 'MySQL', 'MariaDB', 'Microsoft SQL Server', 'Oracle Database', 'SQLite',
    'IBM Db2', 'Sybase', 'Teradata', 'MongoDB', 'Redis', 'Memcached', 'Elasticsearch', 'OpenSearch',
    'Amazon DynamoDB', 'Apache Cassandra', 'ScyllaDB', 'Firebase Firestore', 'Firebase Realtime Database',
    'Supabase', 'Neo4j', 'Amazon Neptune', 'ArangoDB', 'OrientDB', 'JanusGraph', 'Pinecone',
    'Qdrant', 'Weaviate', 'Milvus', 'ChromaDB', 'pgvector', 'Faiss', 'Snowflake', 'Google BigQuery',
    'Amazon Redshift', 'Azure Synapse Analytics', 'Databricks SQL', 'ClickHouse', 'DuckDB', 'Apache Druid',
    'InfluxDB', 'TimescaleDB', 'Prometheus TSDB', 'CouchDB', 'Couchbase', 'RavenDB', 'RethinkDB',
    'FoundationDB', 'HBase', 'Apache Hive', 'Presto', 'Trino', 'Apache Impala', 'SingleStore',
    'CockroachDB', 'YugabyteDB', 'Vitess', 'PlanetScale', 'TiDB', 'Spanner', 'Firestore',
    'Realm Database', 'ObjectBox', 'LevelDB', 'RocksDB', 'Berkeley DB', 'GraphQL Databases',
    'Database Design', 'Database Normalization', 'Database Indexing', 'Query Optimization',
    'Database Replication', 'Database Sharding', 'Database Migration', 'Database Administration',
    'Database Backup and Recovery', 'Stored Procedures', 'Database Triggers', 'Database Views',
    'ORM', 'SQLAlchemy', 'Hibernate', 'Entity Framework', 'Prisma', 'Sequelize', 'TypeORM',
    'Django ORM', 'ActiveRecord', 'MyBatis', 'JPA', 'Liquibase', 'Flyway', 'Alembic',
  ],

  'Amazon Web Services': [
    'Amazon Web Services', 'AWS Lambda', 'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon Aurora',
    'Amazon DynamoDB', 'Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'Amazon CloudFront', 'Amazon Route 53',
    'Amazon VPC', 'AWS IAM', 'AWS CloudFormation', 'AWS CDK', 'AWS SAM', 'Amazon API Gateway',
    'Amazon SQS', 'Amazon SNS', 'Amazon Kinesis', 'Amazon MSK', 'Amazon EventBridge', 'AWS Step Functions',
    'Amazon Cognito', 'AWS Secrets Manager', 'AWS Systems Manager', 'AWS CloudWatch', 'AWS X-Ray',
    'Amazon Elasticache', 'Amazon ElastiCache Redis', 'Amazon DocumentDB', 'Amazon Neptune',
    'Amazon Redshift', 'Amazon Athena', 'AWS Glue', 'Amazon EMR', 'Amazon SageMaker', 'Amazon Bedrock',
    'Amazon Comprehend', 'Amazon Rekognition', 'Amazon Textract', 'Amazon Polly', 'Amazon Transcribe',
    'Amazon Lex', 'AWS Amplify', 'Amazon AppSync', 'AWS App Runner', 'Amazon Lightsail', 'Amazon WorkSpaces',
    'AWS Batch', 'Amazon MQ', 'AWS CodePipeline', 'AWS CodeBuild', 'AWS CodeDeploy', 'AWS CodeCommit',
    'Amazon ECR', 'AWS Elastic Beanstalk', 'AWS Transfer Family', 'Amazon FSx', 'Amazon EFS',
    'Amazon S3 Glacier', 'AWS Backup', 'AWS WAF', 'AWS Shield', 'Amazon GuardDuty', 'Amazon Inspector',
    'AWS Config', 'AWS CloudTrail', 'AWS Organizations', 'AWS Control Tower', 'AWS Direct Connect',
    'AWS VPN', 'AWS Transit Gateway', 'Amazon OpenSearch Service', 'Amazon QuickSight', 'Amazon MWAA',
    'AWS IoT Core', 'Amazon Timestream', 'Amazon Keyspaces', 'Amazon MemoryDB', 'AWS Outposts',
    'AWS Local Zones', 'AWS Wavelength', 'Amazon CloudWatch Logs', 'Amazon Managed Grafana',
    'Amazon Managed Prometheus', 'AWS PrivateLink', 'Amazon Data Firehose', 'AWS Lake Formation',
    'Amazon Kendra', 'Amazon Q', 'AWS HealthLake', 'Amazon FinSpace',
  ],

  'Microsoft Azure': [
    'Microsoft Azure', 'Azure Functions', 'Azure App Service', 'Azure Virtual Machines',
    'Azure Kubernetes Service', 'Azure Container Instances', 'Azure Container Registry', 'Azure Blob Storage',
    'Azure SQL Database', 'Azure Cosmos DB', 'Azure Cache for Redis', 'Azure Virtual Network',
    'Azure Active Directory', 'Microsoft Entra ID', 'Azure Key Vault', 'Azure DevOps', 'Azure Pipelines',
    'Azure Resource Manager', 'Azure Bicep', 'Azure ARM Templates', 'Azure Logic Apps', 'Azure Service Bus',
    'Azure Event Grid', 'Azure Event Hubs', 'Azure Data Factory', 'Azure Synapse Analytics',
    'Azure Databricks', 'Azure Machine Learning', 'Azure OpenAI Service', 'Azure Cognitive Services',
    'Azure Bot Service', 'Azure API Management', 'Azure Front Door', 'Azure CDN', 'Azure Load Balancer',
    'Azure Application Gateway', 'Azure Firewall', 'Azure Monitor', 'Azure Log Analytics',
    'Azure Application Insights', 'Azure Sentinel', 'Microsoft Defender for Cloud', 'Azure Backup',
    'Azure Site Recovery', 'Azure DNS', 'Azure ExpressRoute', 'Azure VPN Gateway', 'Azure Static Web Apps',
    'Azure Spring Cloud', 'Azure Functions Durable', 'Azure Stream Analytics', 'Azure Data Lake Storage',
    'Azure HDInsight', 'Azure Purview', 'Azure Arc', 'Azure Stack', 'Power Platform', 'Power Automate',
    'Power Apps', 'Power BI Embedded', 'Microsoft Graph API', 'Azure IoT Hub', 'Azure Digital Twins',
  ],

  'Google Cloud Platform': [
    'Google Cloud Platform', 'Google Cloud Run', 'Google Kubernetes Engine', 'Google Compute Engine',
    'Google Cloud Functions', 'Google Cloud Storage', 'Google Cloud SQL', 'Google Cloud Spanner',
    'Google BigQuery', 'Google Firestore', 'Google Cloud Pub/Sub', 'Google Cloud Dataflow',
    'Google Cloud Dataproc', 'Google Cloud Composer', 'Google Cloud Build', 'Google Cloud Deploy',
    'Google Artifact Registry', 'Google Cloud IAM', 'Google Cloud VPC', 'Google Cloud Load Balancing',
    'Google Cloud CDN', 'Google Cloud DNS', 'Google Cloud Armor', 'Google Cloud Monitoring',
    'Google Cloud Logging', 'Google Cloud Trace', 'Google Cloud Profiler', 'Google Vertex AI',
    'Google Cloud Vision API', 'Google Cloud Natural Language API', 'Google Cloud Speech-to-Text',
    'Google Cloud Text-to-Speech', 'Google Cloud Translation', 'Google Cloud AutoML', 'Google Gemini API',
    'Google Cloud Endpoints', 'Google Apigee', 'Google Cloud Scheduler', 'Google Cloud Tasks',
    'Google Cloud Memorystore', 'Google Cloud Bigtable', 'Google Cloud Datastore', 'Google Cloud Filestore',
    'Google Cloud Identity', 'Google Cloud Secret Manager', 'Google Cloud KMS', 'Anthos', 'Google Cloud VMware Engine',
    'Google Cloud IoT Core', 'Looker Studio', 'Google Cloud Workstations', 'Google Cloud Batch',
  ],

  'Cloud Platforms': [
    'Multi-Cloud Architecture', 'Hybrid Cloud', 'Cloud Migration', 'Cloud Cost Optimization',
    'Cloud Security', 'Cloud Networking', 'Cloudflare', 'Cloudflare Workers', 'Cloudflare R2',
    'Heroku', 'Vercel', 'Netlify', 'Railway', 'Render', 'Fly.io', 'DigitalOcean', 'Linode',
    'Akamai', 'Fastly', 'Serverless', 'Edge Computing', 'Edge Functions', 'Cloud Native',
    'Cloud Architecture', 'Well-Architected Framework', 'FinOps', 'Cloud Governance', 'SaaS Architecture',
    'PaaS', 'IaaS', 'Cloud Disaster Recovery', 'Cloud High Availability', 'Cloud Scalability',
    'Cloud Observability', 'Cloud Automation', 'Cloud Landing Zones', 'Cloud Networking Design',
  ],

  'DevOps & Infrastructure': [
    'Docker', 'Kubernetes', 'Helm', 'Kustomize', 'Terraform', 'OpenTofu', 'Ansible', 'Pulumi',
    'Crossplane', 'AWS CloudFormation', 'Azure Bicep', 'Google Deployment Manager', 'Chef', 'Puppet',
    'SaltStack', 'OpenShift', 'Rancher', 'K3s', 'Minikube', 'Kind', 'Istio', 'Linkerd', 'Consul',
    'Envoy', 'NGINX', 'Apache HTTP Server', 'Traefik', 'HAProxy', 'Linux', 'Unix', 'Windows Server',
    'Prometheus', 'Grafana', 'ELK Stack', 'Elasticsearch Logging', 'Logstash', 'Kibana', 'Fluentd',
    'Fluent Bit', 'Loki', 'Datadog', 'New Relic', 'Splunk', 'Dynatrace', 'AppDynamics', 'PagerDuty',
    'Opsgenie', 'VictoriaMetrics', 'Thanos', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'Sentry',
    'Infrastructure as Code', 'Configuration Management', 'Container Orchestration', 'Service Mesh',
    'Platform Engineering', 'Site Reliability Engineering', 'Chaos Engineering', 'Chaos Monkey',
    'LitmusChaos', 'Gremlin', 'Capacity Planning', 'Incident Management', 'On-Call Management',
    'Runbooks', 'Postmortems', 'SLI/SLO/SLA', 'Error Budgets', 'Golden Signals', 'Observability',
    'Monitoring', 'Logging', 'Tracing', 'Alerting', 'Auto Scaling', 'Blue-Green Deployment',
    'Canary Deployment', 'Rolling Deployment', 'Feature Flags', 'LaunchDarkly', 'Unleash',
    'HashiCorp Vault', 'Sealed Secrets', 'External Secrets Operator', 'Cert-Manager', 'Let\'s Encrypt',
    'Nginx Ingress', 'MetalLB', 'Cilium', 'Calico', 'Flannel', 'Container Security', 'Trivy',
    'Falco', 'OPA Gatekeeper', 'Kyverno', 'Podman', 'containerd', 'CRI-O', 'Buildah', 'Skopeo',
    'Nomad', 'Mesos', 'Docker Compose', 'Podman Compose', 'Vagrant', 'Packer', 'Cloud-init',
  ],

  'CI/CD & Version Control': [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI',
    'Travis CI', 'Azure DevOps Pipelines', 'TeamCity', 'Bamboo', 'Argo CD', 'Flux CD', 'Tekton',
    'Spinnaker', 'Drone CI', 'Buildkite', 'Codefresh', 'Harness', 'Octopus Deploy', 'GoCD',
    'Continuous Integration', 'Continuous Deployment', 'Continuous Delivery', 'Git Flow', 'GitHub Flow',
    'Trunk-Based Development', 'Semantic Versioning', 'Conventional Commits', 'Release Management',
    'Artifact Management', 'Nexus Repository', 'JFrog Artifactory', 'Harbor Registry', 'Sonatype Nexus',
    'Dependency Management', 'Monorepo Management', 'Nx', 'Turborepo', 'Lerna', 'Rush', 'Bazel',
    'Gradle Build Cache', 'Maven Repository', 'npm Registry', 'PyPI', 'NuGet', 'Cargo Registry',
    'Code Review', 'Pull Request Workflow', 'Branch Protection', 'Merge Queues', 'Git Hooks',
    'Pre-commit Hooks', 'Husky', 'lint-staged', 'Renovate', 'Dependabot', 'Snyk',
  ],

  'Testing & QA': [
    'Jest', 'Cypress', 'Playwright', 'Selenium', 'WebDriverIO', 'Puppeteer', 'TestCafe', 'Nightwatch.js',
    'PyTest', 'unittest', 'JUnit', 'TestNG', 'Mockito', 'Mocha', 'Chai', 'Sinon', 'Jasmine', 'Karma',
    'Vitest', 'Testing Library', 'Enzyme', 'Cucumber', 'Gherkin', 'Behave', 'SpecFlow', 'Robot Framework',
    'Postman', 'Newman', 'Insomnia', 'REST Assured', 'Karate DSL', 'Pact', 'Contract Testing',
    'k6', 'Gatling', 'JMeter', 'Locust', 'Artillery', 'BlazeMeter', 'Unit Testing', 'Integration Testing',
    'End-to-End Testing', 'Regression Testing', 'Smoke Testing', 'Sanity Testing', 'Performance Testing',
    'Load Testing', 'Stress Testing', 'Soak Testing', 'Security Testing', 'Penetration Testing',
    'Accessibility Testing', 'Usability Testing', 'Exploratory Testing', 'Test Automation',
    'Test-Driven Development', 'Behavior-Driven Development', 'Mutation Testing', 'Property-Based Testing',
    'Snapshot Testing', 'Visual Regression Testing', 'Percy', 'Applitools', 'Test Management', 'TestRail',
    'Zephyr', 'Xray', 'qTest', 'Allure Report', 'Coverage.py', 'JaCoCo', 'Istanbul', 'Codecov',
    'Quality Assurance', 'QA Engineering', 'Shift-Left Testing', 'Shift-Right Testing', 'Chaos Testing',
  ],

  'AI & Machine Learning': [
    'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Generative AI', 'Large Language Models',
    'LLM Integration', 'LLM Fine-Tuning', 'Retrieval Augmented Generation', 'Prompt Engineering',
    'Agentic AI', 'AI Agents', 'Multi-Agent Systems', 'TensorFlow', 'PyTorch', 'Keras', 'JAX',
    'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'Hugging Face', 'Transformers Library',
    'LangChain', 'LangGraph', 'LlamaIndex', 'Semantic Kernel', 'Haystack', 'OpenAI API', 'Anthropic API',
    'Google Gemini API', 'Azure OpenAI', 'Amazon Bedrock', 'Cohere API', 'Mistral AI', 'Ollama',
    'vLLM', 'Triton Inference Server', 'ONNX', 'ONNX Runtime', 'TensorRT', 'OpenVINO', 'Core ML',
    'TensorFlow Lite', 'MLflow', 'Kubeflow', 'Weights & Biases', 'Neptune.ai', 'Comet ML', 'DVC',
    'Feature Stores', 'Feast', 'Tecton', 'MLOps', 'Model Deployment', 'Model Monitoring', 'Model Drift',
    'A/B Testing for ML', 'Computer Vision', 'Natural Language Processing', 'Speech Recognition',
    'Text-to-Speech', 'Named Entity Recognition', 'Sentiment Analysis', 'Text Classification',
    'Information Retrieval', 'Recommendation Systems', 'Reinforcement Learning', 'Time Series Forecasting',
    'Anomaly Detection', 'Clustering', 'Classification', 'Regression Analysis', 'Feature Engineering',
    'Hyperparameter Tuning', 'AutoML', 'H2O.ai', 'DataRobot', 'OpenCV', 'YOLO', 'Detectron2',
    'Stable Diffusion', 'Midjourney API', 'DALL-E', 'Whisper', 'GPT Models', 'Claude Models',
    'Llama Models', 'Gemini Models', 'Vector Embeddings', 'Semantic Search', 'Knowledge Graphs',
    'Graph Neural Networks', 'Federated Learning', 'Edge AI', 'Responsible AI', 'AI Ethics',
    'Explainable AI', 'SHAP', 'LIME', 'Model Interpretability', 'AI Safety', 'Guardrails',
    'RAG Pipelines', 'Embedding Models', 'Fine-Tuning LoRA', 'Quantization', 'Distillation',
    'GitHub Copilot', 'Cursor AI', 'Code Generation', 'AI-Assisted Development',
  ],

  'Data Engineering': [
    'Pandas', 'NumPy', 'Polars', 'Dask', 'Vaex', 'Apache Spark', 'PySpark', 'Spark SQL', 'Spark Streaming',
    'Apache Flink', 'Apache Beam', 'Apache Airflow', 'Prefect', 'Dagster', 'Luigi', 'Apache NiFi',
    'dbt', 'dbt Core', 'ETL Pipelines', 'ELT Pipelines', 'Data Pipelines', 'Data Warehousing',
    'Data Lakehouse', 'Delta Lake', 'Apache Iceberg', 'Apache Hudi', 'Data Modeling', 'Dimensional Modeling',
    'Star Schema', 'Snowflake Schema', 'Data Vault', 'Kimball Methodology', 'Data Mesh', 'Data Fabric',
    'Master Data Management', 'Data Quality', 'Great Expectations', 'Soda Core', 'Data Governance',
    'Data Catalog', 'Apache Atlas', 'Alation', 'Collibra', 'Data Lineage', 'Change Data Capture',
    'Debezium', 'Kafka Connect', 'Apache Sqoop', 'Talend', 'Informatica', 'Matillion', 'Fivetran',
    'Stitch Data', 'Airbyte', 'Meltano', 'Segment', 'RudderStack', 'Snowplow', 'Apache Kafka Streams',
    'ksqlDB', 'Apache Storm', 'Samza', 'Stream Processing', 'Batch Processing', 'Real-Time Analytics',
    'OLAP', 'OLTP', 'Data Orchestration', 'Workflow Automation', 'Apache Superset', 'Metabase',
    'Redash', 'Mode Analytics', 'Hex', 'Observable', 'Jupyter Notebooks', 'JupyterLab', 'Apache Zeppelin',
    'Databricks', 'Databricks Unity Catalog', 'Snowflake Data Cloud', 'Amazon Data Pipeline',
    'Google Cloud Data Fusion', 'Azure Data Factory', 'Data Engineering', 'Big Data', 'Hadoop',
    'HDFS', 'MapReduce', 'Apache Hive', 'Apache Pig', 'Apache Oozie', 'Cloudera', 'Hortonworks',
  ],

  'Data Analytics & BI': [
    'Tableau', 'Power BI', 'Looker', 'Looker Studio', 'Qlik Sense', 'QlikView', 'MicroStrategy',
    'SAP BusinessObjects', 'IBM Cognos', 'Domo', 'Sisense', 'ThoughtSpot', 'Mode', 'Sigma Computing',
    'Data Analysis', 'Business Intelligence', 'Data Visualization', 'Dashboard Design', 'KPI Design',
    'SQL Analytics', 'Excel Advanced', 'Google Sheets Advanced', 'Pivot Tables', 'Statistical Analysis',
    'Hypothesis Testing', 'A/B Testing', 'Cohort Analysis', 'Funnel Analysis', 'Retention Analysis',
    'Customer Analytics', 'Product Analytics', 'Marketing Analytics', 'Financial Analytics',
    'Mixpanel', 'Amplitude', 'Heap Analytics', 'Google Analytics', 'Google Analytics 4', 'Adobe Analytics',
    'Hotjar', 'FullStory', 'Pendo', 'Looker ML', 'dbt Metrics', 'Semantic Layer', 'Metrics Layer',
    'Data Storytelling', 'Executive Reporting', 'Self-Service BI', 'Embedded Analytics',
  ],

  'Security & Cybersecurity': [
    'Cybersecurity', 'Application Security', 'Network Security', 'Cloud Security', 'DevSecOps',
    'Security Operations', 'SOC Analysis', 'SIEM', 'Splunk SIEM', 'IBM QRadar', 'Microsoft Sentinel',
    'Elastic Security', 'Threat Detection', 'Threat Hunting', 'Incident Response', 'Digital Forensics',
    'Malware Analysis', 'Vulnerability Management', 'Vulnerability Assessment', 'Penetration Testing',
    'Red Team Operations', 'Blue Team Operations', 'Purple Team', 'Bug Bounty', 'OWASP', 'OWASP Top 10',
    'Secure Coding', 'Static Application Security Testing', 'Dynamic Application Security Testing',
    'SAST', 'DAST', 'IAST', 'Software Composition Analysis', 'SonarQube', 'Checkmarx', 'Veracode',
    'Snyk Security', 'Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 'Kali Linux', 'OSCP',
    'CISSP', 'CEH', 'CompTIA Security+', 'Zero Trust Architecture', 'OAuth 2.0', 'OpenID Connect',
    'JWT', 'SSL/TLS', 'PKI', 'Certificate Management', 'Encryption', 'Cryptography', 'Hashing',
    'Symmetric Encryption', 'Asymmetric Encryption', 'Identity and Access Management', 'IAM',
    'Multi-Factor Authentication', 'Single Sign-On', 'Okta', 'Auth0', 'Keycloak', 'LDAP', 'Active Directory',
    'RBAC', 'ABAC', 'Privileged Access Management', 'Secrets Management', 'HashiCorp Vault',
    'AWS IAM', 'Azure AD Security', 'GCP IAM', 'Firewall Management', 'WAF', 'DDoS Protection',
    'Endpoint Security', 'EDR', 'XDR', 'Antivirus', 'Patch Management', 'Security Compliance',
    'SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA Security', 'GDPR Compliance', 'NIST Framework',
    'CIS Benchmarks', 'Security Auditing', 'Risk Assessment', 'Security Architecture',
    'Container Security', 'Kubernetes Security', 'Supply Chain Security', 'SBOM', 'Phishing Prevention',
  ],

  'Networking': [
    'Computer Networking', 'TCP/IP', 'DNS', 'DHCP', 'HTTP/HTTPS', 'HTTP/2', 'HTTP/3', 'QUIC',
    'TLS', 'SSL', 'VPN', 'IPSec', 'WireGuard', 'OpenVPN', 'BGP', 'OSPF', 'MPLS', 'SD-WAN',
    'Network Design', 'Network Architecture', 'Network Troubleshooting', 'Packet Analysis',
    'Load Balancing', 'CDN', 'Reverse Proxy', 'Forward Proxy', 'NAT', 'VLAN', 'Subnetting',
    'CIDR', 'Routing', 'Switching', 'Firewalls', 'Network Security', 'Wireless Networking',
    'Wi-Fi', 'Bluetooth', 'Network Monitoring', 'SNMP', 'NetFlow', 'Cisco IOS', 'Cisco ASA',
    'Juniper Networks', 'Palo Alto Networks', 'Fortinet', 'F5 BIG-IP', 'Arista Networks',
    'Network Automation', 'Ansible Networking', 'NetBox', 'NAPALM', 'gNMI', 'NETCONF', 'RESTCONF',
    'Software-Defined Networking', 'OpenFlow', 'Network Virtualization', 'Overlay Networks',
    'Service Provider Networks', 'Data Center Networking', 'Cloud Networking', 'Zero Trust Network Access',
  ],

  'ERP & Enterprise Software': [
    'SAP', 'SAP ERP', 'SAP S/4HANA', 'SAP Fiori', 'SAP ABAP', 'SAP BW', 'SAP CRM', 'SAP SCM',
    'Oracle ERP', 'Oracle E-Business Suite', 'Oracle Fusion', 'Oracle JD Edwards', 'PeopleSoft',
    'Workday', 'Workday HCM', 'Workday Financials', 'NetSuite', 'Microsoft Dynamics 365',
    'Microsoft Dynamics AX', 'Microsoft Dynamics NAV', 'Microsoft Dynamics GP', 'Infor',
    'Epicor ERP', 'Sage ERP', 'Odoo', 'ERP Implementation', 'ERP Integration', 'ERP Customization',
    'SAP Integration', 'IDoc', 'SAP PI/PO', 'SAP CPI', 'Oracle Integration Cloud', 'Enterprise Integration',
    'Master Data Management', 'Enterprise Architecture', 'TOGAF', 'Zachman Framework', 'BPMN',
    'Business Process Management', 'Camunda', 'Pega', 'Appian', 'ServiceNow', 'ServiceNow Development',
    'ServiceNow Administration', 'ITIL', 'ITSM', 'CMDB', 'IT Asset Management',
  ],

  'CRM & Marketing Technology': [
    'Salesforce', 'Salesforce Administration', 'Salesforce Development', 'Apex', 'Visualforce',
    'Lightning Web Components', 'Salesforce Flow', 'Salesforce Marketing Cloud', 'Salesforce Service Cloud',
    'Salesforce Commerce Cloud', 'HubSpot', 'Marketo', 'Pardot', 'Eloqua', 'Mailchimp', 'Klaviyo',
    'Braze', 'Iterable', 'Customer.io', 'Segment CDP', 'Tealium', 'Google Tag Manager', 'Adobe Experience Cloud',
    'Adobe Analytics', 'Adobe Target', 'Salesforce CRM', 'Zoho CRM', 'Pipedrive', 'Freshsales',
    'CRM Administration', 'Lead Management', 'Marketing Automation', 'Email Marketing', 'Campaign Management',
    'Customer Data Platform', 'Personalization Engines', 'Optimizely', 'VWO', 'Dynamic Yield',
  ],

  'Design & UX': [
    'UI Design', 'UX Design', 'UX Research', 'User Research', 'Usability Testing', 'Wireframing',
    'Prototyping', 'Information Architecture', 'Interaction Design', 'Visual Design', 'Design Thinking',
    'Human-Centered Design', 'Figma', 'Sketch', 'Adobe XD', 'Adobe Photoshop', 'Adobe Illustrator',
    'Adobe InDesign', 'Adobe After Effects', 'Framer', 'InVision', 'Zeplin', 'Miro', 'FigJam',
    'Design Systems', 'Component Libraries', 'Atomic Design', 'Responsive Design', 'Mobile-First Design',
    'Accessibility Design', 'Inclusive Design', 'Typography', 'Color Theory', 'Icon Design',
    'Motion Design', 'Micro-interactions', 'Design Handoff', 'User Journey Mapping', 'Persona Development',
    'Heuristic Evaluation', 'A/B Testing Design', 'Conversion Rate Optimization', 'Landing Page Design',
  ],

  'Tools & Platforms': [
    'Visual Studio Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'PhpStorm', 'GoLand', 'Rider',
    'CLion', 'RubyMine', 'DataGrip', 'Android Studio', 'Xcode', 'Eclipse', 'Visual Studio',
    'Visual Studio Code Remote', 'Neovim', 'Vim', 'Emacs', 'Sublime Text', 'Atom', 'Notepad++',
    'Jira', 'Confluence', 'Linear', 'Asana', 'Trello', 'Monday.com', 'ClickUp', 'Notion',
    'Slack', 'Microsoft Teams', 'Discord', 'Zoom', 'Google Workspace', 'Microsoft 365',
    'Swagger', 'OpenAPI', 'Postman', 'Insomnia', 'Hoppscotch', 'Storybook', 'npm', 'Yarn', 'pnpm',
    'Bun', 'Maven', 'Gradle', 'Ant', 'Make', 'CMake', 'Ninja', 'Conan', 'vcpkg', 'Cargo',
    'pip', 'Poetry', 'pipenv', 'Conda', 'RVM', 'rbenv', 'nvm', 'asdf', 'Homebrew', 'Chocolatey',
    'Docker Desktop', 'Lens Kubernetes IDE', 'k9s', 'Portainer', 'Rancher Desktop', 'OrbStack',
    'Postman Collections', 'Bruno API Client', 'Thunder Client', 'DBeaver', 'pgAdmin', 'MySQL Workbench',
    'MongoDB Compass', 'Redis Insight', 'TablePlus', 'DataGrip SQL', 'Azure Data Studio',
    'GitHub Copilot', 'Tabnine', 'Codeium', 'Sourcegraph', 'SonarQube', 'ESLint', 'Prettier',
    'Stylelint', 'RuboCop', 'Black Formatter', 'Ruff', 'mypy', 'Pylint', 'Checkstyle', 'SpotBugs',
  ],

  'Architecture & Methodologies': [
    'Microservices', 'Monolithic Architecture', 'Service-Oriented Architecture', 'Event-Driven Architecture',
    'Domain-Driven Design', 'Clean Architecture', 'Hexagonal Architecture', 'CQRS', 'Event Sourcing',
    'Saga Pattern', 'Circuit Breaker Pattern', 'API Design', 'System Design', 'Distributed Systems',
    'High Availability Design', 'Fault Tolerance', 'Scalability Design', 'Performance Engineering',
    'Capacity Planning', 'Caching Architecture', 'Message-Driven Architecture', 'Serverless Architecture',
    'Layered Architecture', 'Pipeline Architecture', 'Space-Based Architecture', 'Agile', 'Scrum',
    'Kanban', 'SAFe', 'LeSS', 'Extreme Programming', 'Waterfall', 'Hybrid Agile', 'DevOps Culture',
    'Test-Driven Development', 'Behavior-Driven Development', 'Pair Programming', 'Code Review Culture',
    'Object-Oriented Programming', 'Functional Programming', 'Procedural Programming', 'Reactive Programming',
    'Design Patterns', 'SOLID Principles', 'DRY Principle', 'KISS Principle', 'YAGNI',
    'Refactoring', 'Technical Debt Management', 'Legacy Modernization', 'Strangler Fig Pattern',
    'Twelve-Factor App', 'Cloud Native Architecture', 'Platform Engineering', 'FinOps Practices',
    'Documentation', 'Architecture Decision Records', 'C4 Model', 'UML', 'Sequence Diagrams',
  ],

  'Blockchain & Web3': [
    'Blockchain', 'Ethereum', 'Solidity Smart Contracts', 'Web3.js', 'Ethers.js', 'Hardhat',
    'Truffle Suite', 'Foundry', 'Smart Contract Development', 'Smart Contract Auditing', 'DeFi',
    'NFT Development', 'IPFS', 'Polygon', 'Solana', 'Rust Solana', 'Cosmos SDK', 'Hyperledger Fabric',
    'Hyperledger Besu', 'Chainlink', 'The Graph', 'MetaMask Integration', 'WalletConnect',
    'Token Standards', 'ERC-20', 'ERC-721', 'ERC-1155', 'Zero-Knowledge Proofs', 'zkSync', 'Layer 2 Scaling',
    'Cross-Chain Bridges', 'Decentralized Applications', 'DAO Development', 'Cryptocurrency',
  ],

  'IT Systems & Support': [
    'System Administration', 'Linux Administration', 'Windows Administration', 'macOS Administration',
    'Active Directory', 'Group Policy', 'DNS Administration', 'DHCP Administration', 'Virtualization',
    'VMware vSphere', 'VMware ESXi', 'Hyper-V', 'KVM', 'Proxmox', 'Citrix', 'VDI', 'Remote Desktop Services',
    'Backup and Recovery', 'Disaster Recovery', 'Storage Administration', 'SAN', 'NAS', 'iSCSI',
    'File Server Management', 'Print Server Management', 'Email Administration', 'Microsoft Exchange',
    'Office 365 Administration', 'Google Workspace Administration', 'Help Desk', 'IT Support',
    'Desktop Support', 'Troubleshooting', 'Hardware Support', 'Software Deployment', 'SCCM', 'Intune',
    'Jamf', 'Mobile Device Management', 'Endpoint Management', 'Patch Management', 'Asset Management',
    'Monitoring Tools', 'Nagios', 'Zabbix', 'PRTG', 'SolarWinds', 'PowerShell Scripting', 'Bash Scripting',
    'Automation Scripting', 'IT Documentation', 'Knowledge Base Management',
  ],

  'Business & Productivity': [
    'Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'Microsoft Outlook', 'Microsoft Access',
    'Microsoft Project', 'Microsoft Visio', 'Microsoft SharePoint', 'SharePoint Administration',
    'Google Docs', 'Google Sheets', 'Google Slides', 'Google Drive', 'QuickBooks', 'SAP Concur',
    'Confluence Documentation', 'Technical Writing', 'Business Analysis', 'Requirements Gathering',
    'Process Mapping', 'Stakeholder Management', 'Project Management', 'Program Management',
    'Product Management', 'Roadmap Planning', 'Backlog Management', 'User Stories', 'Acceptance Criteria',
    'Gantt Charts', 'Risk Management', 'Budget Tracking', 'Vendor Management', 'Contract Management',
  ],

  'Operating Systems': [
    'Linux', 'Ubuntu', 'Debian', 'CentOS', 'RHEL', 'Rocky Linux', 'AlmaLinux', 'Fedora', 'SUSE Linux',
    'Arch Linux', 'Alpine Linux', 'Windows', 'Windows Server', 'Windows 11', 'macOS', 'Unix',
    'FreeBSD', 'OpenBSD', 'Solaris', 'AIX', 'HP-UX', 'Chrome OS', 'Android OS Internals', 'iOS Internals',
  ],

  'CMS & E-commerce': [
    'WordPress', 'WordPress Development', 'WooCommerce', 'Shopify', 'Shopify Liquid', 'Magento',
    'Adobe Commerce', 'BigCommerce', 'Salesforce Commerce Cloud', 'Contentful', 'Sanity', 'Strapi',
    'Directus', 'Ghost', 'Drupal', 'Joomla', 'Webflow', 'Squarespace', 'Headless CMS', 'Content Management',
    'E-commerce Development', 'Payment Gateway Integration', 'Stripe', 'PayPal', 'Square', 'Adyen',
    'Braintree', 'Checkout.com', 'Subscription Billing', 'Cart Abandonment', 'Product Catalog Management',
  ],

  'Robotic Process Automation': [
    'Robotic Process Automation', 'UiPath', 'Automation Anywhere', 'Blue Prism', 'Power Automate Desktop',
    'Microsoft Power Automate', 'WorkFusion', 'Pega RPA', 'Process Automation', 'Workflow Automation',
    'Bot Development', 'OCR Automation', 'Intelligent Document Processing',
  ],

  'Low-Code & No-Code': [
    'Low-Code Development', 'No-Code Development', 'Microsoft Power Apps', 'OutSystems', 'Mendix',
    'Appian Low-Code', 'Bubble', 'Retool', 'Airtable', 'Zapier', 'Make.com', 'n8n', 'IFTTT',
    'Internal Tools Development', 'Rapid Application Development',
  ],

  'Scientific & Engineering Computing': [
    'Scientific Computing', 'Numerical Analysis', 'Computational Physics', 'Computational Biology',
    'Bioinformatics', 'Computational Chemistry', 'Finite Element Analysis', 'Computational Fluid Dynamics',
    'CAD', 'AutoCAD', 'SolidWorks', 'CATIA', 'Creo', 'Revit', 'BIM', 'GIS', 'ArcGIS', 'QGIS',
    'Remote Sensing', 'Signal Processing', 'Digital Signal Processing', 'Control Systems',
    'Simulink', 'LabVIEW', 'ANSYS', 'COMSOL Multiphysics', 'OpenFOAM', 'ROS', 'Robot Operating System',
    'Computer-Aided Manufacturing', 'CNC Programming', '3D Printing', 'Additive Manufacturing',
  ],

  'Quality & Compliance': [
    'Quality Management', 'ISO 9001', 'Six Sigma', 'Lean Manufacturing', 'Kaizen', 'Total Quality Management',
    'Statistical Process Control', 'Root Cause Analysis', 'FMEA', 'CAPA', 'GMP', 'FDA Compliance',
    'Medical Device Software', 'IEC 62304', 'ISO 13485', 'Validation Engineering', 'Computer System Validation',
    'GxP Compliance', 'Audit Management', 'Regulatory Compliance', 'SOX Compliance', 'CMMI',
  ],

  'Localization & Internationalization': [
    'Internationalization', 'Localization', 'i18n', 'l10n', 'Translation Management', 'Crowdin',
    'Lokalise', 'Phrase', 'Transifex', 'RTL Layout Support', 'Unicode', 'Locale Management',
    'Globalization', 'Multi-Language Applications', 'Content Localization',
  ],

  'Performance & Optimization': [
    'Performance Optimization', 'Application Profiling', 'Memory Profiling', 'CPU Profiling',
    'Database Query Tuning', 'Front-End Performance', 'Back-End Performance', 'Load Testing Analysis',
    'Bottleneck Analysis', 'Latency Optimization', 'Throughput Optimization', 'Resource Optimization',
    'Cost Performance Optimization', 'Benchmarking', 'APM', 'Real User Monitoring', 'Synthetic Monitoring',
  ],

  'Documentation & Technical Communication': [
    'Technical Documentation', 'API Documentation', 'Developer Documentation', 'README Writing',
    'Markdown Documentation', 'Docs-as-Code', 'MkDocs', 'Sphinx Documentation', 'GitBook', 'Read the Docs',
    'Swagger Documentation', 'OpenAPI Specification', 'Architecture Documentation', 'Runbook Writing',
    'Knowledge Transfer', 'Technical Presentations', 'Diagramming', 'Lucidchart', 'Draw.io', 'PlantUML',
    'Mermaid Diagrams', 'Confluence Wiki', 'Notion Documentation',
  ],
};

function normalizeKey(title) {
  return title.trim().toLowerCase();
}

function buildAllSkills() {
  const seen = new Set();
  /** @type {{ title: string; category: string }[]} */
  const skills = [];

  for (const [category, titles] of Object.entries(SKILL_CATALOG_BY_CATEGORY)) {
    for (const title of titles) {
      const key = normalizeKey(title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      skills.push({ title: title.trim(), category });
    }
  }

  skills.sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    return cat !== 0 ? cat : a.title.localeCompare(b.title);
  });

  return skills;
}

function buildSkills(maxCount = 1000) {
  const seen = new Set();
  /** @type {{ title: string; category: string }[]} */
  const skills = [];

  /** High-demand categories first each round; round-robin keeps breadth at the cap. */
  const categoryOrder = Object.keys(SKILL_CATALOG_BY_CATEGORY);
  const queues = categoryOrder.map((category) =>
    SKILL_CATALOG_BY_CATEGORY[category].map((title) => ({ title, category }))
  );

  let round = 0;
  while (skills.length < maxCount) {
    let addedThisRound = false;
    for (let c = 0; c < categoryOrder.length && skills.length < maxCount; c++) {
      const item = queues[c][round];
      if (!item) continue;
      const key = normalizeKey(item.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      skills.push({ title: item.title.trim(), category: item.category });
      addedThisRound = true;
    }
    round++;
    if (!addedThisRound) break;
  }

  skills.sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    return cat !== 0 ? cat : a.title.localeCompare(b.title);
  });

  return skills;
}

function renderTs(skills) {
  const lines = [
    '/** Global technical skills catalog — one-time seed into coreSkills/ collection. */',
    '',
    'export interface SeedSkill {',
    '  title: string;',
    '  category: string;',
    '}',
    '',
    `/** ${skills.length} curated technical skills (SWEBOK, cloud-native, AI/ML, enterprise, 2025–2026 job market). */`,
    'export const SEED_CORE_SKILLS: SeedSkill[] = [',
  ];

  let currentCategory = '';
  for (const { title, category } of skills) {
    if (category !== currentCategory) {
      currentCategory = category;
      lines.push(`  // ${category}`);
    }
    const escaped = title.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`  { title: '${escaped}', category: '${category}' },`);
  }

  lines.push('];', '');
  return lines.join('\n');
}

const MAX_SEED = Number(process.env.MAX_CORE_SKILLS_SEED || 0);
const skills = MAX_SEED > 0 ? buildSkills(MAX_SEED) : buildAllSkills();
writeFileSync(OUT, renderTs(skills), 'utf8');
console.log(`Wrote ${skills.length} skills to ${OUT}`);

const byCategory = {};
for (const s of skills) {
  byCategory[s.category] = (byCategory[s.category] || 0) + 1;
}
console.log('By category:', Object.keys(byCategory).length, 'categories');
if (MAX_SEED > 0 && skills.length < 950) {
  console.warn(`Warning: only ${skills.length} skills — target is ~${MAX_SEED}`);
  process.exitCode = 1;
}
