import os
import re

footer = """
<footer class="demo-footer">
  <div class="container demo-footer-grid">
    <div>
      <h4 style="font-family: 'Space Grotesk', sans-serif;">VORTEX</h4>
      <p>Este é um site de demonstração de alta performance criado pela Vortex. Um ambiente controlado para mostrar o potencial de conversão e design que podemos entregar para o seu negócio.</p>
      <div class="footer-socials">
        <a href="#"><i class="fa-brands fa-instagram"></i></a>
        <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
        <a href="#"><i class="fa-brands fa-youtube"></i></a>
      </div>
    </div>
    <div>
      <h4>Links Rápidos</h4>
      <ul>
        <li><a href="#">Sobre o Modelo</a></li>
        <li><a href="#">Diferenciais</a></li>
        <li><a href="#">Como Comprar</a></li>
        <li><a href="#">Suporte VIP</a></li>
      </ul>
    </div>
    <div>
      <h4>Contato</h4>
      <ul>
        <li><i class="fa-brands fa-whatsapp" style="margin-right: 8px;"></i> (66) 99937-3778</li>
        <li><i class="fa-regular fa-envelope" style="margin-right: 8px;"></i> contato@vortex.com</li>
        <li><i class="fa-solid fa-location-dot" style="margin-right: 8px;"></i> Atendimento Global</li>
      </ul>
    </div>
  </div>
  <div class="demo-footer-bottom">
    <p>&copy; 2026 Vortex Web. Todos os direitos reservados.</p>
  </div>
</footer>
<script src="assets/js/demos.js"></script>
</body>
"""

files = [f for f in os.listdir('.') if f.startswith('demo-') and f.endswith('.html')]

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if fname == 'demo-hype.html':
        content = re.sub(r'<footer style="background: #000; padding: 60px 0; border-top: 1px solid #222;">.*?</footer>', '', content, flags=re.DOTALL)
        
    content = content.replace('</body>', footer)
    
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footer injected successfully in all demo files.")
